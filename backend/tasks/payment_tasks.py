from celery import shared_task
import time
from django.utils import timezone
from apps.users.models import CustomUser
from apps.payments.models import SalaryAdvanceRequest, WorkerBankAccount
from apps.payments.services import disburse_salary, naira_to_kobo
from apps.payments.squad_client import SquadClient, SquadAPIError


@shared_task
def end_of_month_salary_disbursement(year: int, month: int):
    """
    Runs at the end of the month to trigger salary disbursements for all eligible workers.
    """
    workers = CustomUser.objects.filter(role="worker", is_active=True)
    processed = 0
    errors = []

    for worker in workers:
        try:
            disburse_salary(worker=worker, year=year, month=month)
            processed += 1
        except ValueError as e:
            # E.g., no verified bank account
            errors.append({"worker_id": worker.id, "error": str(e)})
        except SquadAPIError as e:
            # Squad API failed
            errors.append({"worker_id": worker.id, "error": f"Squad Error: {e}"})
        except Exception as e:
            errors.append({"worker_id": worker.id, "error": f"Unexpected Error: {e}"})

    return {"processed": processed, "errors": errors}

@shared_task(bind=True, max_retries=3)
def process_salary_advance(self, advance_id: int):
    try:
        advance = SalaryAdvanceRequest.objects.select_related("worker").get(id=advance_id)
    except SalaryAdvanceRequest.DoesNotExist:
        return {"error": "Advance request not found"}

    if advance.status != SalaryAdvanceRequest.STATUS_PENDING:
        return {"status": "already_processed"}

    bank_account = WorkerBankAccount.objects.filter(worker=advance.worker, is_verified=True).first()
    if not bank_account:
        advance.status = SalaryAdvanceRequest.STATUS_REJECTED
        advance.save(update_fields=["status"])
        return {"error": "No verified bank account"}

    client = SquadClient()
    
    # 1. ALWAYS run account lookup before transferring
    try:
        lookup = client.verify_bank_account(
            account_number=bank_account.account_number, 
            bank_code=bank_account.bank_code
        )
    except SquadAPIError as e:
        advance.status = SalaryAdvanceRequest.STATUS_REJECTED
        advance.save(update_fields=["status"])
        return {"error": f"Bank lookup failed: {e}"}

    # 2. Initiate Transfer
    try:
        transfer = client.initiate_transfer(
            amount_kobo=naira_to_kobo(advance.approved_amount),
            bank_code=bank_account.bank_code,
            account_number=bank_account.account_number,
            account_name=bank_account.account_name,
            transaction_reference=advance.squad_reference,
            narration=f"VerifyForce salary advance {advance.year}-{advance.month:02d}",
        )
        advance.status = SalaryAdvanceRequest.STATUS_DISBURSED
        advance.disbursed_at = timezone.now()
        advance.save(update_fields=["status", "disbursed_at"])
        return {"status": "success", "reference": advance.squad_reference}
        
    except SquadAPIError as e:
        status_code = getattr(e, "status_code", 500)
        
        if status_code in (424, 412) or "timeout" in str(e).lower():
            # Squad Rule: On 424 Timeout or 412 Reversed, always re-query before retry!
            try:
                # Give it a couple of seconds before requery
                time.sleep(2)
                status_check = client.get_transfer_status(advance.squad_reference)
                
                if status_check.get("transaction_status") == "success":
                    advance.status = SalaryAdvanceRequest.STATUS_DISBURSED
                    advance.disbursed_at = timezone.now()
                    advance.save(update_fields=["status", "disbursed_at"])
                    return {"status": "success_after_timeout", "reference": advance.squad_reference}
                elif status_check.get("transaction_status") in ("failed", "reversed"):
                    raise self.retry(exc=e, countdown=60)
                else:
                    raise self.retry(exc=e, countdown=60)
            except SquadAPIError as check_err:
                raise self.retry(exc=check_err, countdown=60)
        else:
            advance.status = SalaryAdvanceRequest.STATUS_REJECTED
            advance.save(update_fields=["status"])
            return {"error": f"Transfer failed: {e}", "payload": getattr(e, "payload", {})}
