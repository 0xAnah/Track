from datetime import time
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.logs.models import DailyLog, TaskEntry
from apps.scoring.models import MonthlyScore, ScoreDeduction
from apps.users.models import CustomUser
from tasks.log_tasks import ai_analyze_submitted_log

User = get_user_model()


class LogTaskTests(TestCase):
    def setUp(self):
        self.worker = User.objects.create_user(
            username="worker-task-log",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-TASK-LOG",
        )
        self.log = DailyLog.objects.create(
            worker=self.worker,
            date=timezone.localdate(),
            status=DailyLog.STATUS_SUBMITTED,
            submitted_at=timezone.now(),
        )
        self.task = TaskEntry.objects.create(
            daily_log=self.log,
            title="Prepare memo",
            description="Prepared procurement memo",
            initiated_by="Director",
            handed_to="Secretary",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )

    @patch("tasks.log_tasks.analyze_log")
    def test_ai_task_updates_log_and_scores(self, mock_analyze):
        mock_analyze.return_value = {
            "verdict": "flagged",
            "score_impact": -5,
            "chain_issues": [{"task_id": str(self.task.id), "reason": "Missing clear handover recipient"}],
            "summary": "Chain issue detected.",
            "deduction_reason": "incomplete_chain",
        }
        result = ai_analyze_submitted_log(self.log.id)
        self.assertEqual(result["verdict"], "flagged")

        self.log.refresh_from_db()
        self.task.refresh_from_db()
        self.assertEqual(self.log.status, DailyLog.STATUS_FLAGGED)
        self.assertEqual(self.log.ai_score_impact, -5)
        self.assertFalse(self.task.is_chain_complete)

        score = MonthlyScore.objects.get(worker=self.worker, year=self.log.date.year, month=self.log.date.month)
        self.assertEqual(score.current_score, 95)
        deduction = ScoreDeduction.objects.get(monthly_score=score)
        self.assertEqual(deduction.reason, "incomplete_chain")
        self.assertEqual(deduction.applied_by, ScoreDeduction.APPLIED_BY_AI)
