"""
ai_engine/analyzers.py
-----------------------
All analysis functions called by Celery tasks.
Nothing in this file touches Django models directly —
callers pass in the data, this module returns structured results.

Detection layers implemented:
  1. Sign-in / sign-out timestamp analysis       → check_attendance_anomalies()
  2. Daily log chain analysis                    → analyze_log()
  3. Score deduction logic                       → compute_deductions()
  4. Approved leave exclusion                    → (handled by caller before calling here)
  5. Collusion ring detection (graph analysis)   → detect_collusion_rings()
  6. NLP fabrication detection                   → (embedded inside analyze_log via Claude)
  7. Ghost worker behavioural signatures         → check_ghost_signatures()
  8. Cross-worker narrative coherence            → check_narrative_coherence()
"""

import json
import math
import statistics
from collections import defaultdict
from datetime import datetime, time, timedelta
from typing import Any

from ai_engine.client import call_claude
from ai_engine.prompts import (
    COLLUSION_REVIEW_PROMPT,
    GHOST_SIGNATURE_PROMPT,
    LOG_ANALYSIS_PROMPT,
    MONTHLY_SUMMARY_PROMPT,
    NARRATIVE_COHERENCE_PROMPT,
)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

import re

def _safe_json(raw: str, fallback: dict) -> dict:
    """Parse JSON from Claude. Returns fallback dict on any parse failure."""
    try:
        # Extract everything between the first '{' and last '}' or first '[' and last ']'
        match = re.search(r'(\{.*\}|\[.*\])', raw, re.DOTALL)
        if match:
            cleaned = match.group(1)
        else:
            # Fallback to just stripping markdown if regex didn't find clear brackets
            cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, AttributeError):
        return fallback


def _time_to_minutes(t: str) -> int:
    """Convert 'HH:MM' string to minutes since midnight."""
    h, m = map(int, t.split(":"))
    return h * 60 + m


def _std_dev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    return statistics.stdev(values)


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 1 — ATTENDANCE TIMESTAMP ANALYSIS
# Pure Python — no AI call needed for this layer.
# Called nightly by scoring_tasks.nightly_score_deduction()
# ─────────────────────────────────────────────────────────────────────────────

WORK_START_HOUR = 8
WORK_START_MINUTE = 0
LATE_THRESHOLD_MINUTES = 30   # More than 30 min after start = late

def check_attendance_anomalies(
    worker_id: int,
    sign_in_time: str | None,
    sign_out_time: str | None,
    date_str: str,
    is_absent: bool,
    absence_excused: bool,
    month_sign_in_times: list[str],  # All sign-in times this month so far (HH:MM)
    month_ip_addresses: list[str],   # All sign-in IPs this month
    today_ip: str | None,
) -> dict:
    """
    Analyses a single day's attendance record and the month's pattern so far.

    Returns:
    {
      "is_late": bool,
      "minutes_late": int,
      "is_absent_unexcused": bool,
      "late_count_this_month": int,
      "late_pattern_threshold_reached": bool,  # True when late_count == 5
      "ip_anomaly": bool,
      "signin_time_variance_minutes": float,
      "deductions": [
        { "reason": str, "points": int, "detail": str }
      ]
    }
    """
    deductions = []
    work_start = WORK_START_HOUR * 60 + WORK_START_MINUTE
    late_threshold = work_start + LATE_THRESHOLD_MINUTES

    # --- Absence check ---
    is_absent_unexcused = is_absent and not absence_excused
    if is_absent_unexcused:
        deductions.append({
            "reason": "unexcused_absence",
            "points": 12,
            "detail": f"Unexcused absence on {date_str}. No approved leave on record.",
        })

    # --- Late check ---
    is_late = False
    minutes_late = 0
    if sign_in_time and not is_absent:
        signin_mins = _time_to_minutes(sign_in_time)
        if signin_mins > late_threshold:
            is_late = True
            minutes_late = signin_mins - work_start

    # Count lates this month including today
    late_count = sum(
        1 for t in month_sign_in_times
        if _time_to_minutes(t) > late_threshold
    )
    if is_late:
        late_count += 1

    late_pattern_reached = (late_count == 5)  # Trigger exactly at 5 (once)
    if late_pattern_reached:
        deductions.append({
            "reason": "late_signin_pattern",
            "points": 5,
            "detail": f"Reached 5 late sign-ins this month. Pattern threshold triggered.",
        })

    # --- IP anomaly detection ---
    # Flags if today's IP is completely new AND the worker has been consistent for 10+ days
    # (could be legitimate travel, so this is flagged for monitoring, not auto-deducted)
    ip_anomaly = False
    if today_ip and month_ip_addresses and len(month_ip_addresses) >= 10:
        unique_ips = set(month_ip_addresses)
        if len(unique_ips) == 1 and today_ip not in unique_ips:
            ip_anomaly = True   # Always used same IP then suddenly different

    # --- Sign-in time variance (for ghost worker detection) ---
    all_times = [_time_to_minutes(t) for t in month_sign_in_times if t]
    if sign_in_time:
        all_times.append(_time_to_minutes(sign_in_time))
    signin_variance = _std_dev([float(t) for t in all_times]) if all_times else 0.0

    return {
        "is_late": is_late,
        "minutes_late": minutes_late,
        "is_absent_unexcused": is_absent_unexcused,
        "late_count_this_month": late_count,
        "late_pattern_threshold_reached": late_pattern_reached,
        "ip_anomaly": ip_anomaly,
        "signin_time_variance_minutes": round(signin_variance, 2),
        "deductions": deductions,
    }


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2 + 6 — DAILY LOG ANALYSIS (chain completeness + NLP fabrication)
# AI call via Claude. Called async after every log submission.
# ─────────────────────────────────────────────────────────────────────────────

def analyze_log(daily_log_data: dict) -> dict:
    """
    Sends a worker's daily log to Claude for full analysis.

    daily_log_data shape:
    {
      "worker_name": str,
      "worker_role": str,
      "worker_department": str,
      "date": str,
      "sign_in_time": str | None,
      "sign_out_time": str | None,
      "tasks": [
        {
          "id": str,
          "title": str,
          "description": str,
          "initiated_by": str,
          "handed_to": str,
          "start_time": str,
          "end_time": str
        }
      ]
    }

    Returns the parsed Claude JSON or a safe fallback.
    """
    # Quick pre-check: no tasks at all = missing log, don't call AI
    if not daily_log_data.get("tasks"):
        return {
            "verdict": "flagged",
            "score_impact": -8,
            "confidence": 1.0,
            "chain_issues": [],
            "narrative_issues": [],
            "time_issues": [],
            "ghost_signals": [],
            "summary": "No task entries filed for this working day.",
            "deduction_reason": "missing_log",
        }

    # Pre-check: detect copy-paste patterns in Python before AI call
    # (saves tokens and adds a deterministic check)
    tasks = daily_log_data["tasks"]
    descriptions = [t.get("description", "").strip().lower() for t in tasks]
    duplicate_descriptions = len(descriptions) != len(set(descriptions))

    user_message = json.dumps(daily_log_data, indent=2, ensure_ascii=False)

    fallback = {
        "verdict": "verified",
        "score_impact": 0,
        "confidence": 0.0,
        "chain_issues": [],
        "narrative_issues": [],
        "time_issues": [],
        "ghost_signals": [],
        "summary": "AI analysis unavailable — log accepted without penalty.",
        "deduction_reason": None,
    }

    try:
        raw = call_claude(LOG_ANALYSIS_PROMPT, user_message, max_tokens=1500)
        result = _safe_json(raw, fallback)
    except Exception:
        return fallback

    # Inject our pre-check result if AI missed it
    if duplicate_descriptions and not result.get("narrative_issues"):
        result["narrative_issues"] = [{
            "task_id": "multiple",
            "type": "copy_paste",
            "detail": "Two or more task descriptions are identical — detected pre-AI check.",
        }]
        if result["verdict"] == "verified":
            result["verdict"] = "flagged"
            result["score_impact"] = min(result["score_impact"], -5)
            result["summary"] = "Duplicate task descriptions detected. " + result["summary"]

    return result


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 3 — SCORE DEDUCTION COMPUTATION
# Pure Python — translates analysis results into concrete point deductions.
# ─────────────────────────────────────────────────────────────────────────────

# Centralised deduction config — change thresholds here only
DEDUCTION_CONFIG = {
    "unexcused_absence":   {"min": 10, "max": 15, "default": 12},
    "missing_log":         {"min": 5,  "max": 8,  "default": 8},
    "incomplete_chain":    {"min": 3,  "max": 5,  "default": 5},
    "late_signin_pattern": {"min": 5,  "max": 5,  "default": 5},
    "ai_anomaly":          {"min": 5,  "max": 15, "default": 10},
}


def compute_deductions(
    log_analysis_result: dict,
    attendance_result: dict,
) -> list[dict]:
    """
    Merges attendance and log analysis results into a final list of
    deduction dicts ready to be written to ScoreDeduction.

    Each dict: { "reason": str, "points": int, "detail": str, "applied_by": str }
    """
    deductions = []

    # From attendance analysis
    for d in attendance_result.get("deductions", []):
        deductions.append({
            "reason": d["reason"],
            "points": d["points"],
            "detail": d["detail"],
            "applied_by": "system",
        })

    # From AI log analysis
    verdict = log_analysis_result.get("verdict", "verified")
    score_impact = log_analysis_result.get("score_impact", 0)
    deduction_reason = log_analysis_result.get("deduction_reason")

    if score_impact < 0 and deduction_reason:
        points = abs(score_impact)
        cfg = DEDUCTION_CONFIG.get(deduction_reason, {"min": 1, "max": 15, "default": 5})
        # Clamp to configured range
        points = max(cfg["min"], min(cfg["max"], points))
        deductions.append({
            "reason": deduction_reason,
            "points": points,
            "detail": log_analysis_result.get("summary", "AI-detected issue."),
            "applied_by": "ai",
        })

    # If verdict is suspicious with no explicit deduction_reason, apply ai_anomaly
    if verdict == "suspicious" and not deduction_reason:
        deductions.append({
            "reason": "ai_anomaly",
            "points": DEDUCTION_CONFIG["ai_anomaly"]["default"],
            "detail": log_analysis_result.get("summary", "AI detected suspicious log patterns."),
            "applied_by": "ai",
        })

    return deductions


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 5 — COLLUSION RING DETECTION (graph analysis)
# Pure Python graph analysis + optional AI review of flagged pairs.
# Called weekly by report_tasks.detect_collusion_rings()
# ─────────────────────────────────────────────────────────────────────────────

def build_handover_graph(task_entries: list[dict]) -> dict:
    """
    Builds a directed graph of handover relationships from a list of task entries.

    task_entries: list of dicts with keys:
        worker_id, worker_name, initiated_by, handed_to, date, title, description

    Returns:
    {
      "edges": { "worker_a_id→worker_b_name": count },
      "out_degree": { worker_id: total_handovers_given },
      "exclusive_pairs": [
        {
          "worker_a_id": ..., "worker_a_name": ...,
          "worker_b_name": ...,
          "a_to_b_count": ...,
          "a_total_handovers": ...,
          "exclusivity_ratio": float   # a_to_b_count / a_total_handovers
        }
      ]
    }
    """
    # Count directed edges: worker_id → handed_to_name
    edge_counts: dict[str, int] = defaultdict(int)
    out_degree: dict[int, int] = defaultdict(int)
    worker_names: dict[int, str] = {}

    for entry in task_entries:
        wid = entry["worker_id"]
        wname = entry["worker_name"]
        handed_to = (entry.get("handed_to") or "").strip()
        if handed_to:
            key = f"{wid}→{handed_to}"
            edge_counts[key] += 1
            out_degree[wid] += 1
            worker_names[wid] = wname

    # Find workers who hand over exclusively (or near-exclusively) to one target
    EXCLUSIVITY_THRESHOLD = 0.80   # 80%+ of handovers go to same person
    MIN_HANDOVERS = 5              # Need at least 5 handovers to be meaningful

    exclusive_pairs = []
    for wid, total in out_degree.items():
        if total < MIN_HANDOVERS:
            continue
        wname = worker_names[wid]
        # Find this worker's most common handover target
        worker_edges = {
            k: v for k, v in edge_counts.items()
            if k.startswith(f"{wid}→")
        }
        if not worker_edges:
            continue
        top_key = max(worker_edges, key=lambda k: worker_edges[k])
        top_count = worker_edges[top_key]
        ratio = top_count / total
        target_name = top_key.split("→", 1)[1]

        if ratio >= EXCLUSIVITY_THRESHOLD:
            exclusive_pairs.append({
                "worker_a_id": wid,
                "worker_a_name": wname,
                "worker_b_name": target_name,
                "a_to_b_count": top_count,
                "a_total_handovers": total,
                "exclusivity_ratio": round(ratio, 3),
            })

    return {
        "edges": dict(edge_counts),
        "out_degree": dict(out_degree),
        "exclusive_pairs": exclusive_pairs,
    }


def find_mutual_exclusivity(
    graph: dict,
    worker_lookup: dict,  # { worker_name_lowercase: worker_id }
) -> list[dict]:
    """
    Takes the handover graph and identifies MUTUAL exclusive pairs —
    Worker A almost always hands to B, AND Worker B almost always hands to A.

    These are the highest-risk collusion signals.

    Returns list of suspect pairs:
    [
      {
        "worker_a_id": int,
        "worker_a_name": str,
        "worker_b_id": int | None,
        "worker_b_name": str,
        "a_to_b_ratio": float,
        "b_to_a_ratio": float | None,
        "risk_level": "medium" | "high",
        "reason": str
      }
    ]
    """
    exclusive = graph["exclusive_pairs"]
    mutual_pairs = []

    for pair_a in exclusive:
        b_name_lower = pair_a["worker_b_name"].lower()
        b_id = worker_lookup.get(b_name_lower)

        # Check if B also exclusively hands to A
        b_to_a_ratio = None
        if b_id:
            b_pair = next(
                (p for p in exclusive
                 if p["worker_a_id"] == b_id
                 and p["worker_b_name"].lower() == pair_a["worker_a_name"].lower()),
                None,
            )
            if b_pair:
                b_to_a_ratio = b_pair["exclusivity_ratio"]

        is_mutual = b_to_a_ratio is not None
        risk = "high" if is_mutual else "medium"
        reason = (
            f"Mutual exclusivity: A→B ratio {pair_a['exclusivity_ratio']:.0%}, "
            f"B→A ratio {b_to_a_ratio:.0%}"
            if is_mutual
            else f"One-sided exclusivity: A→B ratio {pair_a['exclusivity_ratio']:.0%}"
        )

        mutual_pairs.append({
            "worker_a_id": pair_a["worker_a_id"],
            "worker_a_name": pair_a["worker_a_name"],
            "worker_b_id": b_id,
            "worker_b_name": pair_a["worker_b_name"],
            "a_to_b_ratio": pair_a["exclusivity_ratio"],
            "b_to_a_ratio": b_to_a_ratio,
            "risk_level": risk,
            "reason": reason,
        })

    return mutual_pairs


def review_collusion_candidates(
    worker_a: dict,
    worker_b: dict,
    interaction_summary: dict,
) -> dict:
    """
    Sends a suspect pair to Claude for narrative review.

    interaction_summary: {
      "total_days_analysed": int,
      "a_handed_to_b_count": int,
      "b_handed_to_a_count": int,
      "a_total_handovers": int,
      "b_total_handovers": int,
      "sample_interactions": [
        { "date", "direction", "a_description", "b_description" }
      ]
    }
    """
    user_message = json.dumps({
        "worker_a": worker_a,
        "worker_b": worker_b,
        **interaction_summary,
    }, indent=2, ensure_ascii=False)

    fallback = {
        "collusion_likelihood": "medium",
        "confidence": 0.0,
        "plausible_legitimate_reason": None,
        "red_flags": [],
        "recommendation": "monitor",
        "summary": "AI review unavailable — flagged for manual HR review.",
    }

    try:
        raw = call_claude(COLLUSION_REVIEW_PROMPT, user_message, max_tokens=800)
        return _safe_json(raw, fallback)
    except Exception:
        return fallback


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 7 — GHOST WORKER BEHAVIOURAL SIGNATURE DETECTION
# Hybrid: Python computes statistics, Claude interprets the pattern.
# Called weekly per worker by ghost_detection_tasks.weekly_ghost_check()
# ─────────────────────────────────────────────────────────────────────────────

def compute_behavioural_statistics(
    worker_name: str,
    worker_role: str,
    sign_in_times: list[str],     # ["HH:MM", ...]  last 30 days
    sign_out_times: list[str],
    ip_addresses: list[str],
    task_entries: list[dict],     # All task entries last 30 days
                                  # { title, description, initiated_by, handed_to, date }
) -> dict:
    """
    Computes raw statistics needed for ghost worker detection.
    Returns the full stats dict that gets sent to Claude.
    """
    # Sign-in time variance
    signin_minutes = [_time_to_minutes(t) for t in sign_in_times if t]
    signin_std = _std_dev([float(m) for m in signin_minutes]) if signin_minutes else 0.0

    unique_ips = list(set(ip_addresses))

    # Task title repetition
    titles = [e.get("title", "").strip().lower() for e in task_entries]
    unique_titles = set(titles)
    title_repetition_rate = 1.0 - (len(unique_titles) / len(titles)) if titles else 0.0

    # Description vocabulary
    all_words = []
    word_counts = []
    for e in task_entries:
        desc = e.get("description", "")
        words = desc.lower().split()
        all_words.extend(words)
        word_counts.append(len(words))

    vocab_size = len(set(all_words))
    avg_word_count = sum(word_counts) / len(word_counts) if word_counts else 0.0

    # Initiated_by / handed_to diversity
    initiators = [e.get("initiated_by", "").strip() for e in task_entries if e.get("initiated_by")]
    handover_targets = [e.get("handed_to", "").strip() for e in task_entries if e.get("handed_to")]
    unique_initiators = len(set(i.lower() for i in initiators))
    unique_targets = len(set(h.lower() for h in handover_targets))

    always_same_initiator = (unique_initiators <= 1 and len(initiators) >= 5)
    always_same_target = (unique_targets <= 1 and len(handover_targets) >= 5)

    # Days with suspiciously identical log structure
    from collections import Counter
    # A "structure fingerprint" = (task_count, tuple of start_times)
    daily_fingerprints: dict[str, str] = defaultdict(list)
    for e in task_entries:
        daily_fingerprints[e.get("date", "")].append(e.get("start_time", ""))
    fingerprints = [
        f"{len(v)}-{','.join(sorted(v))}"
        for v in daily_fingerprints.values()
    ]
    fp_counter = Counter(fingerprints)
    days_identical_structure = sum(v for v in fp_counter.values() if v > 1)

    return {
        "worker_name": worker_name,
        "worker_role": worker_role,
        "days_analysed": len(sign_in_times),
        "attendance_pattern": {
            "sign_in_times": sign_in_times[-10:],   # Last 10 for context (token limit)
            "sign_out_times": sign_out_times[-10:],
            "ip_addresses": unique_ips[:10],
            "unique_ips": len(unique_ips),
            "signin_time_std_dev_minutes": round(signin_std, 2),
        },
        "log_pattern": {
            "total_logs": len(daily_fingerprints),
            "avg_tasks_per_day": round(len(task_entries) / max(len(daily_fingerprints), 1), 1),
            "unique_task_titles": len(unique_titles),
            "total_task_entries": len(task_entries),
            "title_repetition_rate": round(title_repetition_rate, 3),
            "description_avg_word_count": round(avg_word_count, 1),
            "description_vocabulary_size": vocab_size,
            "days_with_identical_log_structure": days_identical_structure,
        },
        "handover_pattern": {
            "unique_initiated_by_names": unique_initiators,
            "unique_handed_to_names": unique_targets,
            "always_same_initiated_by": always_same_initiator,
            "always_same_handed_to": always_same_target,
        },
    }


def check_ghost_signatures(stats: dict) -> dict:
    """
    Sends pre-computed worker statistics to Claude for ghost-worker interpretation.
    Returns Claude's structured verdict.
    """
    # Fast pre-screen: if none of the thresholds are near-triggered, skip AI call
    ap = stats.get("attendance_pattern", {})
    lp = stats.get("log_pattern", {})
    hp = stats.get("handover_pattern", {})

    red_count = sum([
        ap.get("signin_time_std_dev_minutes", 99) < 5,
        ap.get("unique_ips", 99) == 1,
        lp.get("title_repetition_rate", 0) > 0.5,
        lp.get("description_vocabulary_size", 999) < 50,
        hp.get("always_same_initiated_by", False),
        hp.get("always_same_handed_to", False),
        lp.get("days_with_identical_log_structure", 0) > 3,
    ])

    # If fewer than 2 red flags triggered, skip AI and return clean
    if red_count < 2:
        return {
            "ghost_risk_level": "none",
            "confidence": 0.9,
            "signals_detected": [],
            "legitimate_explanation_possible": True,
            "recommendation": "none",
            "summary": "No significant ghost worker signals detected.",
        }

    user_message = json.dumps(stats, indent=2, ensure_ascii=False)

    fallback = {
        "ghost_risk_level": "medium",
        "confidence": 0.0,
        "signals_detected": [],
        "legitimate_explanation_possible": True,
        "recommendation": "monitor",
        "summary": "AI analysis unavailable — flagged for manual review.",
    }

    try:
        raw = call_claude(GHOST_SIGNATURE_PROMPT, user_message, max_tokens=1000)
        return _safe_json(raw, fallback)
    except Exception:
        return fallback


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 8 — CROSS-WORKER NARRATIVE COHERENCE
# Checks whether Worker A's handover description matches Worker B's receive description.
# Called nightly for all worker pairs who shared a handover that day.
# ─────────────────────────────────────────────────────────────────────────────

def check_narrative_coherence(
    date: str,
    worker_a: dict,   # { name, role, task_title, task_description, handed_to }
    worker_b: dict,   # { name, role, task_title, task_description, initiated_by }
) -> dict:
    """
    Sends a Worker A ↔ Worker B handover pair to Claude for coherence check.
    Returns Claude's structured verdict.
    """
    user_message = json.dumps({
        "date": date,
        "worker_a": worker_a,
        "worker_b": worker_b,
    }, indent=2, ensure_ascii=False)

    fallback = {
        "coherent": True,
        "confidence": 0.0,
        "contradiction_found": False,
        "contradiction_detail": None,
        "both_vague": False,
        "role_mismatch": False,
        "summary": "AI coherence check unavailable.",
        "flag_for_review": False,
    }

    try:
        raw = call_claude(NARRATIVE_COHERENCE_PROMPT, user_message, max_tokens=600)
        return _safe_json(raw, fallback)
    except Exception:
        return fallback


def find_coherence_pairs(
    task_entries_by_worker: dict[int, list[dict]],
    worker_name_to_id: dict[str, int],
    date: str,
) -> list[dict]:
    """
    For a given date, finds all Worker A → Worker B handover pairs where
    both workers filed a log, and the receiving worker mentioned the handing
    worker as their initiator.

    task_entries_by_worker: { worker_id: [ { title, description, initiated_by,
                                             handed_to, worker_name, worker_role } ] }
    worker_name_to_id: { lowercase_name: worker_id }

    Returns list of pairs ready to pass to check_narrative_coherence().
    """
    pairs = []

    for worker_a_id, a_entries in task_entries_by_worker.items():
        for a_task in a_entries:
            handed_to_raw = (a_task.get("handed_to") or "").strip()
            if not handed_to_raw:
                continue

            # Try to find Worker B in the system
            b_id = worker_name_to_id.get(handed_to_raw.lower())
            if b_id is None or b_id == worker_a_id:
                continue

            b_entries = task_entries_by_worker.get(b_id, [])

            # Find a matching task in B's log where initiated_by ≈ Worker A's name
            a_name_lower = (a_task.get("worker_name") or "").lower()
            matching_b_task = next(
                (
                    e for e in b_entries
                    if a_name_lower and a_name_lower in (e.get("initiated_by") or "").lower()
                ),
                None,
            )

            if matching_b_task:
                pairs.append({
                    "worker_a": {
                        "name": a_task.get("worker_name", ""),
                        "role": a_task.get("worker_role", ""),
                        "task_title": a_task.get("title", ""),
                        "task_description": a_task.get("description", ""),
                        "handed_to": handed_to_raw,
                    },
                    "worker_b": {
                        "name": matching_b_task.get("worker_name", ""),
                        "role": matching_b_task.get("worker_role", ""),
                        "task_title": matching_b_task.get("title", ""),
                        "task_description": matching_b_task.get("description", ""),
                        "initiated_by": matching_b_task.get("initiated_by", ""),
                    },
                    "worker_a_id": worker_a_id,
                    "worker_b_id": b_id,
                    "date": date,
                })

    return pairs


# ─────────────────────────────────────────────────────────────────────────────
# MONTHLY SUMMARY
# Called by end-of-month report task.
# ─────────────────────────────────────────────────────────────────────────────

def generate_monthly_summary(report_data: dict) -> str:
    """
    Generates a plain-prose HR briefing paragraph.

    report_data: {
      "hr_name": str,
      "month": str,
      "year": int,
      "total_workers": int,
      "flagged_count": int,
      "tier_breakdown": { "elite": int, "solid": int, "standard": int, "flagged": int },
      "top_deduction_reasons": [ { "reason": str, "count": int } ],
      "collusion_flags": int,
      "ghost_risk_flags": int
    }
    """
    if report_data.get("flagged_count", 0) == 0:
        return (
            f"All {report_data.get('total_workers', 0)} workers in your team maintained "
            f"an integrity score of 70 or above in {report_data.get('month', '')} "
            f"{report_data.get('year', '')}. No salary holds or physical reviews are required. "
            f"Salary disbursement via Squad has been initiated for all team members."
        )

    user_message = json.dumps(report_data, indent=2, ensure_ascii=False)
    fallback = (
        f"{report_data.get('flagged_count', 0)} workers in your team scored below 70 points "
        f"this month and require physical identity verification before salary release."
    )

    try:
        return call_claude(MONTHLY_SUMMARY_PROMPT, user_message, max_tokens=400, temperature=0.3)
    except Exception:
        return fallback
