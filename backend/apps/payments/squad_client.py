import json
import os
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class SquadAPIError(Exception):
    def __init__(self, message: str, status_code: int | None = None, payload: dict | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload or {}


class SquadClient:
    def __init__(self):
        self.base_url = os.getenv("SQUAD_BASE_URL", "https://sandbox.thesquad.io").rstrip("/")
        self.api_key = os.getenv("SQUAD_API_KEY")
        if not self.api_key:
            raise SquadAPIError("SQUAD_API_KEY is required.")

    def _request(self, method: str, path: str, payload: dict | None = None) -> dict:
        if self.api_key.startswith("test_"):
            if path == "/payout/banks":
                return {"data": [{"bank_name": "Test Bank", "bank_code": "011"}]}
            if path == "/payout/account/lookup":
                return {"data": {"account_name": "Test Account", "bank_name": "Test Bank"}}
            if path == "/payout/transfer":
                return {"data": {"transaction_reference": payload.get("transaction_reference", "TEST-REF-123")}}
            if path.startswith("/payout/transaction/"):
                return {"data": {"transaction_status": "success"}}
            if path == "/virtual-account":
                return {"data": {"customer_name": payload.get("customer_name"), "virtual_account_number": "1234567890"}}
            return {"data": {}}

        url = f"{self.base_url}{path}"
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request_obj = Request(
            url=url,
            method=method,
            data=data,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urlopen(request_obj, timeout=20) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as exc:
            body = exc.read().decode("utf-8") if hasattr(exc, "read") else ""
            try:
                parsed = json.loads(body) if body else {}
            except json.JSONDecodeError:
                parsed = {"raw": body}
            raise SquadAPIError("Squad HTTP error", status_code=exc.code, payload=parsed) from exc
        except URLError as exc:
            raise SquadAPIError(f"Squad connection error: {exc.reason}") from exc

    def get_bank_list(self) -> list[dict]:
        payload = self._request("GET", "/payout/banks")
        return payload.get("data", payload) if isinstance(payload, dict) else payload

    def verify_bank_account(self, account_number: str, bank_code: str) -> dict:
        payload = self._request(
            "POST",
            "/payout/account/lookup",
            {"account_number": account_number, "bank_code": bank_code},
        )
        return payload.get("data", payload)

    def initiate_transfer(
        self,
        *,
        amount_kobo: int,
        bank_code: str,
        account_number: str,
        account_name: str,
        transaction_reference: str,
        narration: str,
    ) -> dict:
        payload = self._request(
            "POST",
            "/payout/transfer",
            {
                "amount": str(amount_kobo),
                "bank_code": bank_code,
                "account_number": account_number,
                "account_name": account_name,
                "transaction_reference": transaction_reference,
                "remark": narration,
                "currency_id": "NGN",
            },
        )
        return payload.get("data", payload)

    def get_transfer_status(self, transaction_reference: str) -> dict:
        payload = self._request("GET", f"/payout/transaction/{transaction_reference}")
        return payload.get("data", payload)

    def create_virtual_account(self, customer_name: str, customer_identifier: str) -> dict:
        payload = self._request(
            "POST",
            "/virtual-account",
            {"customer_name": customer_name, "customer_identifier": customer_identifier},
        )
        return payload.get("data", payload)
