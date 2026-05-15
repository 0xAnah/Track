import json
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings

from apps.payments.squad_client import SquadClient


class SquadClientTests(TestCase):
    @patch("apps.payments.squad_client.urlopen")
    @patch("apps.payments.squad_client.os.getenv")
    def test_get_bank_list_returns_data(self, mock_getenv, mock_urlopen):
        mock_getenv.side_effect = lambda key, default=None: {
            "SQUAD_API_KEY": "sk_test",
            "SQUAD_BASE_URL": "https://sandbox.thesquad.io",
        }.get(key, default)

        response = MagicMock()
        response.read.return_value = json.dumps({"data": [{"name": "GTBank", "code": "058"}]}).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = response

        client = SquadClient()
        banks = client.get_bank_list()
        self.assertEqual(banks[0]["code"], "058")

    @patch("apps.payments.squad_client.urlopen")
    @patch("apps.payments.squad_client.os.getenv")
    def test_initiate_transfer_sends_payload(self, mock_getenv, mock_urlopen):
        mock_getenv.side_effect = lambda key, default=None: {
            "SQUAD_API_KEY": "sk_test",
            "SQUAD_BASE_URL": "https://sandbox.thesquad.io",
        }.get(key, default)
        response = MagicMock()
        response.read.return_value = json.dumps({"data": {"transaction_reference": "VF-SAL-1-202605"}}).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = response

        client = SquadClient()
        data = client.initiate_transfer(
            amount_kobo=1000,
            bank_code="058",
            account_number="0123456789",
            account_name="John Doe",
            transaction_reference="VF-SAL-1-202605",
            narration="salary",
        )
        self.assertEqual(data["transaction_reference"], "VF-SAL-1-202605")
