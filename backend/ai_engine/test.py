"""
ai_engine/tests/test_analyzers.py
-----------------------------------
Unit tests for all AI engine analyzer functions.
Run with: python manage.py test ai_engine.tests

Design principle: every test that calls Claude is mocked.
Tests verify the logic around the AI call — not the AI itself.
"""

import json
from unittest.mock import MagicMock, patch
from django.test import TestCase


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 1 TESTS — ATTENDANCE ANOMALY DETECTION (pure Python, no mocks needed)
# ─────────────────────────────────────────────────────────────────────────────

class TestCheckAttendanceAnomalies(TestCase):

    def _call(self, **kwargs):
        from ai_engine.analyzers import check_attendance_anomalies
        defaults = {
            "worker_id": 1,
            "sign_in_time": "08:00",
            "sign_out_time": "17:00",
            "date_str": "2026-05-09",
            "is_absent": False,
            "absence_excused": False,
            "month_sign_in_times": [],
            "month_ip_addresses": [],
            "today_ip": "192.168.1.1",
        }
        defaults.update(kwargs)
        return check_attendance_anomalies(**defaults)

    def test_on_time_no_deductions(self):
        result = self._call(sign_in_time="08:00")
        self.assertFalse(result["is_late"])
        self.assertEqual(result["deductions"], [])

    def test_late_sign_in_detected(self):
        result = self._call(sign_in_time="09:15")
        self.assertTrue(result["is_late"])
        self.assertEqual(result["minutes_late"], 75)  # 9:15 - 8:00

    def test_unexcused_absence_deduction(self):
        result = self._call(sign_in_time=None, is_absent=True, absence_excused=False)
        self.assertTrue(result["is_absent_unexcused"])
        reasons = [d["reason"] for d in result["deductions"]]
        self.assertIn("unexcused_absence", reasons)

    def test_excused_absence_no_deduction(self):
        result = self._call(sign_in_time=None, is_absent=True, absence_excused=True)
        self.assertFalse(result["is_absent_unexcused"])
        self.assertEqual(result["deductions"], [])

    def test_late_pattern_triggers_at_5(self):
        # 4 existing lates + today late = 5 → trigger
        four_lates = ["09:00", "09:15", "09:30", "10:00"]
        result = self._call(
            sign_in_time="09:45",
            month_sign_in_times=four_lates,
        )
        self.assertTrue(result["late_pattern_threshold_reached"])
        reasons = [d["reason"] for d in result["deductions"]]
        self.assertIn("late_signin_pattern", reasons)

    def test_late_pattern_does_not_trigger_before_5(self):
        three_lates = ["09:00", "09:15", "09:30"]
        result = self._call(sign_in_time="09:45", month_sign_in_times=three_lates)
        self.assertFalse(result["late_pattern_threshold_reached"])

    def test_ip_anomaly_detected_after_10_consistent_days(self):
        # Worker always signs in from same IP, then suddenly different
        consistent_ips = ["10.0.0.1"] * 10
        result = self._call(
            month_ip_addresses=consistent_ips,
            today_ip="203.45.67.89",
        )
        self.assertTrue(result["ip_anomaly"])

    def test_no_ip_anomaly_with_varied_history(self):
        varied_ips = ["10.0.0.1", "10.0.0.2", "203.45.67.89"]
        result = self._call(
            month_ip_addresses=varied_ips,
            today_ip="172.16.0.1",
        )
        self.assertFalse(result["ip_anomaly"])


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2 TESTS — LOG ANALYSIS (Claude mocked)
# ─────────────────────────────────────────────────────────────────────────────

MOCK_VERIFIED_RESPONSE = json.dumps({
    "verdict": "verified",
    "score_impact": 0,
    "confidence": 0.95,
    "chain_issues": [],
    "narrative_issues": [],
    "time_issues": [],
    "ghost_signals": [],
    "summary": "All tasks have complete chains and plausible descriptions.",
    "deduction_reason": None,
})

MOCK_FLAGGED_CHAIN_RESPONSE = json.dumps({
    "verdict": "flagged",
    "score_impact": -5,
    "confidence": 0.88,
    "chain_issues": [
        {"task_id": "1", "field": "handed_to", "reason": "Generic placeholder 'N/A' used"}
    ],
    "narrative_issues": [],
    "time_issues": [],
    "ghost_signals": [],
    "summary": "Task 1 has an incomplete chain — handed_to is a placeholder.",
    "deduction_reason": "incomplete_chain",
})

MOCK_SUSPICIOUS_RESPONSE = json.dumps({
    "verdict": "suspicious",
    "score_impact": -12,
    "confidence": 0.79,
    "chain_issues": [],
    "narrative_issues": [
        {"task_id": "1", "type": "vague", "detail": "Description is a generic phrase"},
        {"task_id": "2", "type": "vague", "detail": "No concrete details provided"},
    ],
    "time_issues": [],
    "ghost_signals": [
        {"signal": "Template-like task structure", "detail": "All tasks follow identical pattern"}
    ],
    "summary": "Multiple vague descriptions with no concrete output details. Ghost worker risk.",
    "deduction_reason": "ai_anomaly",
})


def make_log_data(tasks=None):
    return {
        "worker_name": "Test Worker",
        "worker_role": "Finance Officer",
        "worker_department": "Finance",
        "date": "2026-05-09",
        "sign_in_time": "08:00",
        "sign_out_time": "17:00",
        "tasks": tasks if tasks is not None else [
            {
                "id": "1",
                "title": "Budget review",
                "description": "Reviewed Q2 budget allocation for 5 sub-departments.",
                "initiated_by": "Director Salako",
                "handed_to": "Finance Manager",
                "start_time": "09:00",
                "end_time": "11:00",
            }
        ],
    }


class TestAnalyzeLog(TestCase):

    @patch("ai_engine.analyzers.call_claude", return_value=MOCK_VERIFIED_RESPONSE)
    def test_returns_verified_verdict(self, mock_claude):
        from ai_engine.analyzers import analyze_log
        result = analyze_log(make_log_data())
        self.assertEqual(result["verdict"], "verified")
        self.assertEqual(result["score_impact"], 0)

    @patch("ai_engine.analyzers.call_claude", return_value=MOCK_FLAGGED_CHAIN_RESPONSE)
    def test_returns_flagged_verdict_with_chain_issue(self, mock_claude):
        from ai_engine.analyzers import analyze_log
        result = analyze_log(make_log_data())
        self.assertEqual(result["verdict"], "flagged")
        self.assertEqual(len(result["chain_issues"]), 1)
        self.assertEqual(result["deduction_reason"], "incomplete_chain")

    def test_no_tasks_returns_missing_log(self):
        from ai_engine.analyzers import analyze_log
        result = analyze_log(make_log_data(tasks=[]))
        self.assertEqual(result["verdict"], "flagged")
        self.assertEqual(result["deduction_reason"], "missing_log")
        self.assertEqual(result["score_impact"], -8)

    @patch("ai_engine.analyzers.call_claude", return_value=MOCK_VERIFIED_RESPONSE)
    def test_duplicate_descriptions_flagged_in_precheck(self, mock_claude):
        from ai_engine.analyzers import analyze_log
        same_desc = "Did office work and completed duties."
        tasks = [
            {"id": "1", "title": "Task A", "description": same_desc,
             "initiated_by": "Manager", "handed_to": "Team Lead",
             "start_time": "09:00", "end_time": "10:00"},
            {"id": "2", "title": "Task B", "description": same_desc,
             "initiated_by": "Manager", "handed_to": "Team Lead",
             "start_time": "10:00", "end_time": "11:00"},
        ]
        result = analyze_log(make_log_data(tasks=tasks))
        # Even though Claude returned "verified", pre-check overrides
        self.assertEqual(result["verdict"], "flagged")
        self.assertTrue(any(
            i["type"] == "copy_paste"
            for i in result.get("narrative_issues", [])
        ))

    @patch("ai_engine.analyzers.call_claude", side_effect=Exception("API timeout"))
    def test_graceful_fallback_on_api_failure(self, mock_claude):
        from ai_engine.analyzers import analyze_log
        result = analyze_log(make_log_data())
        # Must not raise — returns safe fallback
        self.assertEqual(result["verdict"], "verified")
        self.assertEqual(result["score_impact"], 0)
        self.assertIn("unavailable", result["summary"].lower())


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 3 TESTS — DEDUCTION COMPUTATION
# ─────────────────────────────────────────────────────────────────────────────

class TestComputeDeductions(TestCase):

    def _call(self, log_result, att_result=None):
        from ai_engine.analyzers import compute_deductions
        return compute_deductions(log_result, att_result or {"deductions": []})

    def test_verified_log_no_deductions(self):
        result = self._call({
            "verdict": "verified", "score_impact": 0, "deduction_reason": None, "summary": ""
        })
        self.assertEqual(result, [])

    def test_flagged_log_produces_deduction(self):
        result = self._call({
            "verdict": "flagged",
            "score_impact": -5,
            "deduction_reason": "incomplete_chain",
            "summary": "Chain missing.",
        })
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["reason"], "incomplete_chain")
        self.assertEqual(result[0]["applied_by"], "ai")

    def test_deduction_clamped_to_config_range(self):
        # AI says -50, but incomplete_chain max is 5
        result = self._call({
            "verdict": "flagged",
            "score_impact": -50,
            "deduction_reason": "incomplete_chain",
            "summary": "Chain missing.",
        })
        self.assertLessEqual(result[0]["points"], 5)

    def test_attendance_deductions_merged(self):
        att = {"deductions": [
            {"reason": "unexcused_absence", "points": 12, "detail": "Absent."}
        ]}
        log = {"verdict": "verified", "score_impact": 0, "deduction_reason": None, "summary": ""}
        result = self._call(log, att)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["reason"], "unexcused_absence")
        self.assertEqual(result[0]["applied_by"], "system")

    def test_suspicious_verdict_without_reason_uses_ai_anomaly(self):
        result = self._call({
            "verdict": "suspicious",
            "score_impact": 0,
            "deduction_reason": None,
            "summary": "Suspicious patterns.",
        })
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["reason"], "ai_anomaly")


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 5 TESTS — COLLUSION RING DETECTION (graph, pure Python)
# ─────────────────────────────────────────────────────────────────────────────

class TestBuildHandoverGraph(TestCase):

    def _make_entries(self, pairs):
        """pairs: list of (worker_id, worker_name, handed_to)"""
        return [
            {"worker_id": wid, "worker_name": wname, "handed_to": target}
            for wid, wname, target in pairs
        ]

    def test_exclusive_pair_detected(self):
        from ai_engine.analyzers import build_handover_graph
        # Worker 1 hands to "Worker B" 9 out of 10 times
        entries = self._make_entries(
            [(1, "Worker A", "Worker B")] * 9
            + [(1, "Worker A", "Manager Smith")] * 1
        )
        graph = build_handover_graph(entries)
        self.assertEqual(len(graph["exclusive_pairs"]), 1)
        self.assertEqual(graph["exclusive_pairs"][0]["worker_b_name"], "Worker B")
        self.assertGreaterEqual(graph["exclusive_pairs"][0]["exclusivity_ratio"], 0.8)

    def test_diverse_handovers_not_flagged(self):
        from ai_engine.analyzers import build_handover_graph
        # Worker 1 hands to many different people
        targets = ["Person A", "Person B", "Person C", "Person D", "Person E",
                   "Person F", "Person G", "Person H", "Person I", "Person J"]
        entries = self._make_entries(
            [(1, "Worker A", t) for t in targets]
        )
        graph = build_handover_graph(entries)
        self.assertEqual(graph["exclusive_pairs"], [])

    def test_mutual_exclusivity_identified(self):
        from ai_engine.analyzers import build_handover_graph, find_mutual_exclusivity
        # Worker 1 → "Worker B" exclusively, Worker 2 → "Worker A" exclusively
        entries = self._make_entries(
            [(1, "Worker A", "Worker B")] * 9
            + [(1, "Worker A", "Other")]
            + [(2, "Worker B", "Worker A")] * 9
            + [(2, "Worker B", "Other")]
        )
        graph = build_handover_graph(entries)
        worker_lookup = {"worker a": 1, "worker b": 2}
        mutual = find_mutual_exclusivity(graph, worker_lookup)
        high_risk = [p for p in mutual if p["risk_level"] == "high"]
        self.assertGreater(len(high_risk), 0)


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 7 TESTS — GHOST WORKER STATISTICS
# ─────────────────────────────────────────────────────────────────────────────

class TestComputeBehaviouralStatistics(TestCase):

    def _make_tasks(self, n, title="Budget review", description="Reviewed documents carefully."):
        return [
            {
                "title": title,
                "description": description,
                "initiated_by": "Director Salako",
                "handed_to": "Finance Manager",
                "date": f"2026-05-{str(i+1).zfill(2)}",
                "start_time": "09:00",
            }
            for i in range(n)
        ]

    def test_high_title_repetition_detected(self):
        from ai_engine.analyzers import compute_behavioural_statistics
        tasks = self._make_tasks(20, title="Same task every day")
        stats = compute_behavioural_statistics(
            worker_name="Test Worker",
            worker_role="Officer",
            sign_in_times=["08:01"] * 20,
            sign_out_times=["17:00"] * 20,
            ip_addresses=["10.0.0.1"] * 20,
            task_entries=tasks,
        )
        self.assertGreater(stats["log_pattern"]["title_repetition_rate"], 0.9)

    def test_robotic_signin_variance_near_zero(self):
        from ai_engine.analyzers import compute_behavioural_statistics
        # All sign-ins at exactly 08:00 — std dev should be 0
        stats = compute_behavioural_statistics(
            worker_name="Test Worker",
            worker_role="Officer",
            sign_in_times=["08:00"] * 20,
            sign_out_times=["17:00"] * 20,
            ip_addresses=["10.0.0.1"] * 20,
            task_entries=self._make_tasks(20),
        )
        self.assertEqual(stats["attendance_pattern"]["signin_time_std_dev_minutes"], 0.0)

    def test_single_ip_flagged(self):
        from ai_engine.analyzers import compute_behavioural_statistics
        stats = compute_behavioural_statistics(
            worker_name="Test Worker",
            worker_role="Officer",
            sign_in_times=["08:00"] * 20,
            sign_out_times=["17:00"] * 20,
            ip_addresses=["10.0.0.1"] * 20,
            task_entries=self._make_tasks(20),
        )
        self.assertEqual(stats["attendance_pattern"]["unique_ips"], 1)

    @patch("ai_engine.analyzers.call_claude")
    def test_ghost_check_skips_ai_when_red_count_low(self, mock_claude):
        from ai_engine.analyzers import check_ghost_signatures
        # Provide stats with no red flags
        clean_stats = {
            "worker_name": "Clean Worker",
            "worker_role": "Officer",
            "days_analysed": 20,
            "attendance_pattern": {
                "sign_in_times": ["08:05", "07:58", "08:12"],
                "sign_out_times": ["17:00", "17:15", "16:55"],
                "ip_addresses": ["10.0.0.1", "10.0.0.2"],
                "unique_ips": 2,
                "signin_time_std_dev_minutes": 8.5,
            },
            "log_pattern": {
                "total_logs": 20,
                "avg_tasks_per_day": 3.2,
                "unique_task_titles": 18,
                "total_task_entries": 64,
                "title_repetition_rate": 0.2,
                "description_avg_word_count": 22.0,
                "description_vocabulary_size": 180,
                "days_with_identical_log_structure": 1,
            },
            "handover_pattern": {
                "unique_initiated_by_names": 5,
                "unique_handed_to_names": 4,
                "always_same_initiated_by": False,
                "always_same_handed_to": False,
            },
        }
        result = check_ghost_signatures(clean_stats)
        # AI should NOT have been called
        mock_claude.assert_not_called()
        self.assertEqual(result["ghost_risk_level"], "none")


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 8 TESTS — NARRATIVE COHERENCE
# ─────────────────────────────────────────────────────────────────────────────

class TestNarrativeCoherence(TestCase):

    COHERENT_RESPONSE = json.dumps({
        "coherent": True,
        "confidence": 0.92,
        "contradiction_found": False,
        "contradiction_detail": None,
        "both_vague": False,
        "role_mismatch": False,
        "summary": "Both descriptions consistently reference the same 47 procurement files.",
        "flag_for_review": False,
    })

    INCOHERENT_RESPONSE = json.dumps({
        "coherent": False,
        "confidence": 0.85,
        "contradiction_found": True,
        "contradiction_detail": "Worker A says 'sent 47 files'; Worker B says 'received a single report'.",
        "both_vague": False,
        "role_mismatch": False,
        "summary": "Contradiction in handover volume — fabrication likely.",
        "flag_for_review": True,
    })

    def _worker_a(self):
        return {
            "name": "Emeka Okafor",
            "role": "Finance Officer",
            "task_title": "Budget file transfer",
            "task_description": "Sent 47 procurement files to Ngozi for audit review.",
            "handed_to": "Ngozi Gbadamosi",
        }

    def _worker_b(self):
        return {
            "name": "Ngozi Gbadamosi",
            "role": "Audit Officer",
            "task_title": "Receive procurement files",
            "task_description": "Received 47 procurement files from Emeka for Q2 audit.",
            "initiated_by": "Emeka Okafor",
        }

    @patch("ai_engine.analyzers.call_claude", return_value=COHERENT_RESPONSE)
    def test_coherent_pair_not_flagged(self, mock_claude):
        from ai_engine.analyzers import check_narrative_coherence
        result = check_narrative_coherence("2026-05-09", self._worker_a(), self._worker_b())
        self.assertTrue(result["coherent"])
        self.assertFalse(result["flag_for_review"])

    @patch("ai_engine.analyzers.call_claude", return_value=INCOHERENT_RESPONSE)
    def test_incoherent_pair_flagged(self, mock_claude):
        from ai_engine.analyzers import check_narrative_coherence
        result = check_narrative_coherence("2026-05-09", self._worker_a(), self._worker_b())
        self.assertFalse(result["coherent"])
        self.assertTrue(result["flag_for_review"])
        self.assertTrue(result["contradiction_found"])

    @patch("ai_engine.analyzers.call_claude", side_effect=Exception("timeout"))
    def test_fallback_on_api_failure_does_not_flag(self, mock_claude):
        from ai_engine.analyzers import check_narrative_coherence
        result = check_narrative_coherence("2026-05-09", self._worker_a(), self._worker_b())
        # Safe fallback — do not penalise on API failure
        self.assertFalse(result["flag_for_review"])

    def test_find_coherence_pairs_matches_correctly(self):
        from ai_engine.analyzers import find_coherence_pairs
        task_entries_by_worker = {
            1: [{"title": "File transfer", "description": "Sent files.",
                 "initiated_by": "Manager", "handed_to": "ngozi gbadamosi",
                 "worker_name": "Emeka Okafor", "worker_role": "Officer"}],
            2: [{"title": "File receipt", "description": "Got files.",
                 "initiated_by": "emeka okafor", "handed_to": "Audit Lead",
                 "worker_name": "Ngozi Gbadamosi", "worker_role": "Auditor"}],
        }
        name_to_id = {"emeka okafor": 1, "ngozi gbadamosi": 2}
        pairs = find_coherence_pairs(task_entries_by_worker, name_to_id, "2026-05-09")
        self.assertEqual(len(pairs), 1)
        self.assertEqual(pairs[0]["worker_a_id"], 1)
        self.assertEqual(pairs[0]["worker_b_id"], 2)
