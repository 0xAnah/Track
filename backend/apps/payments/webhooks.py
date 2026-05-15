import hashlib
import hmac
import json
import os

from django.utils import timezone

from .models import SalaryAdvanceRequest, SalaryDisbursement


def verify_squad_signature(raw_body: bytes, provided_signature: str | None) -> bool:
    secret = os.getenv("SQUAD_WEBHOOK_SECRET") or os.getenv("SQUAD_API_KEY") or ""
    if not secret or not provided_signature:
        return False
    computed = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(computed, provided_signature)


def _extract_reference(payload: dict) -> str | None:
    body = payload.get("Body", {})
    return (
        body.get("transaction_ref")
        or body.get("transaction_reference")
        or payload.get("TransactionRef")
        or payload.get("transaction_reference")
    )


def _extract_status(payload: dict) -> str:
    body = payload.get("Body", {})
    raw = str(body.get("transaction_status", "")).lower()
    if raw in {"success", "successful", "completed"}:
        return "success"
    if raw in {"failed", "error"}:
        return "failed"
    return "pending"


def process_squad_webhook(raw_body: bytes) -> dict:
    payload = json.loads(raw_body.decode("utf-8"))
    reference = _extract_reference(payload)
    if not reference:
        return {"processed": False, "reason": "missing_reference"}

    status = _extract_status(payload)

    disbursement = SalaryDisbursement.objects.filter(squad_reference=reference).first()
    if disbursement:
        if status == "success":
            disbursement.status = SalaryDisbursement.STATUS_SUCCESS
            disbursement.paid_at = timezone.now()
        elif status == "failed":
            disbursement.status = SalaryDisbursement.STATUS_FAILED
        disbursement.squad_response = payload
        disbursement.save(update_fields=["status", "paid_at", "squad_response"])
        return {"processed": True, "target": "salary_disbursement", "reference": reference, "status": status}

    advance = SalaryAdvanceRequest.objects.filter(squad_reference=reference).first()
    if advance:
        if status == "success":
            advance.status = SalaryAdvanceRequest.STATUS_DISBURSED
            if not advance.disbursed_at:
                advance.disbursed_at = timezone.now()
        elif status == "failed":
            advance.status = SalaryAdvanceRequest.STATUS_REJECTED
        advance.save(update_fields=["status", "disbursed_at"])
        return {"processed": True, "target": "salary_advance", "reference": reference, "status": status}

    return {"processed": False, "reason": "reference_not_found", "reference": reference}
