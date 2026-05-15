from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.scoring.models import ScoreDeduction
from apps.scoring.services import (
    TIER_ELITE,
    TIER_FLAGGED,
    TIER_SOLID,
    TIER_STANDARD,
    apply_deduction,
    get_or_create_score,
    get_tier_for_score,
)
from apps.users.models import CustomUser

User = get_user_model()


class ScoringServiceTests(TestCase):
    def setUp(self):
        self.worker = User.objects.create_user(
            username="worker-score-model",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-SCORE-MODEL",
        )

    def test_get_or_create_score_defaults_to_100(self):
        score = get_or_create_score(self.worker, year=2026, month=5)
        self.assertEqual(score.current_score, 100)
        same = get_or_create_score(self.worker, year=2026, month=5)
        self.assertEqual(score.id, same.id)

    def test_get_tier_for_score(self):
        self.assertEqual(get_tier_for_score(95), TIER_ELITE)
        self.assertEqual(get_tier_for_score(85), TIER_SOLID)
        self.assertEqual(get_tier_for_score(72), TIER_STANDARD)
        self.assertEqual(get_tier_for_score(69), TIER_FLAGGED)

    def test_apply_deduction_creates_audit_and_updates_flag(self):
        score, deduction = apply_deduction(
            worker=self.worker,
            reason=ScoreDeduction.REASON_AI_ANOMALY,
            points=40,
            detail="Anomaly",
            applied_by=ScoreDeduction.APPLIED_BY_AI,
            score_date=timezone.localdate(),
        )
        self.assertEqual(score.current_score, 60)
        self.assertTrue(score.is_flagged)
        self.assertEqual(deduction.points_deducted, 40)
