# Backend Implementation Roadmap (Track / VerifyForce)

## Problem statement
The backend is currently scaffold-heavy, while the project docs define a full domain workflow (auth, attendance, logs, scoring, reports, payments, AI, and async automation). The goal is to implement the backend end-to-end in a production-ready sequence that reduces rework and keeps dependencies explicit.

## Proposed approach
Build from foundations upward: environment/settings -> data model -> auth/permissions -> core domains -> integrations/webhooks -> async jobs -> tests -> hardening -> release docs.  
Use SQL todos as the operational checklist (`backend-00-setup` to `backend-12-docs-delivery`) and update statuses as work progresses.

## Step-by-step execution plan

1. **Environment and bootstrap**
   - Finalize local/dev/prod settings strategy and env var contract.
   - Ensure DB, Redis, Celery, and Django startup paths are consistent.
   - Confirm migration workflow and baseline project health.

2. **Data modeling and migrations**
   - Implement/verify models for users, attendance, logs, scoring, reports, payments.
   - Add constraints/indexes for auditability and query-heavy access patterns.
   - Create and apply initial migrations in correct dependency order.

3. **Auth + users domain**
   - Build login/refresh/logout and profile endpoints.
   - Implement role permissions (HR vs worker) and assignment flows.
   - Enforce HR-scoped worker access.

4. **Attendance + leave domain**
   - Implement sign-in, sign-out, today, and history endpoints.
   - Implement leave request + HR approval/rejection.
   - Ensure approved leave affects deduction logic correctly.

5. **Daily logs + AI hook points**
   - Implement submit/today/history/HR worker-date endpoints.
   - Persist chain fields (`initiated_by`, `handed_to`) and validation metadata.
   - Trigger async AI analysis after submission.

6. **Scoring engine**
   - Implement score lifecycle and deduction application services.
   - Add tier computation and immutable deduction trail behavior.
   - Expose worker and HR score endpoints.

7. **Reports domain**
   - Implement monthly report generation and retrieval for HR.
   - Implement flagged worker review update flow.

8. **Payments domain**
   - Implement bank list, bank registration/verification, salary preview/status.
   - Implement advance request/history and HR team payment summary.
   - Implement held-salary release flow.

9. **Webhook processing**
   - Implement Squad webhook endpoint with signature verification.
   - Make updates idempotent and safe for retries.

10. **Celery workflows**
   - Implement scheduled tasks for nightly scoring, monthly report generation, salary disbursement.
   - Implement on-submit log AI analysis task.
   - Wire task orchestration and failure handling.

11. **Testing strategy**
   - Build model/service/view/task/webhook tests.
   - Keep both full-suite and single-module test runs reliable.
   - Cover authorization, edge cases, and failure paths.

12. **Hardening + operations**
   - Tighten logging, error surfaces, and admin controls.
   - Validate security defaults, env separation, and deployment readiness.

13. **Final docs + delivery**
   - Reconcile endpoint docs with implemented behavior.
   - Produce final backend handoff notes and runbook-level setup instructions.

## Execution dependencies
- The canonical dependency chain is tracked in SQL via `todo_deps`.
- High-level sequence: setup -> models -> auth -> attendance/leave -> logs/AI hooks -> scoring -> reports/payments -> webhooks -> celery -> tests -> hardening -> docs.

## Working notes
- work on each of the task as a system designer and a professional software engineer
- Treat this roadmap as the reference for all backend work sessions.
- At the start of each implementation task: mark todo `in_progress`.
- At completion: mark todo `done` and move to next dependency-ready item.

## Progress updates
- ✅ `backend-00-setup` completed.
- ✅ `backend-01-data-models` completed.
- ✅ `backend-02-auth-users` completed (including HR/worker signup key onboarding flow).
- ✅ `backend-03-attendance-leave` completed:
  - Implemented attendance APIs: sign-in, sign-out, today, my-history, HR worker history.
  - Implemented leave APIs: request, my-requests, pending, approve, reject.
  - Leave approval now marks covered dates as `absence_excused=True`.
  - Added attendance/leave tests and re-ran full backend test suite successfully.
- ✅ `backend-04-logs-ai-hooks` completed:
  - Implemented logs APIs: submit, today, my-history, HR worker history, HR worker-date detail.
  - Added task-entry payload validation and date constraints for submission.
  - Wired async AI hook dispatch via `ai_analyze_submitted_log`.
  - Implemented log AI task updates for `DailyLog` status/analysis, `TaskEntry` chain flags, and AI-linked score deductions.
  - Added logs model/view/task tests and re-ran targeted + full backend test suites successfully.
- ✅ `backend-05-scoring` completed:
  - Implemented scoring services: `get_or_create_score`, `apply_deduction`, `get_tier_for_score`.
  - Implemented scoring APIs: my score, worker score (HR), team scores (HR), worker deductions (HR).
  - Added URL support for both `/api/v1/scoring/*` and `/api/v1/scores/*`.
  - Refactored log AI task to use shared scoring deduction service.
  - Added scoring model/view tests and re-ran targeted + full backend test suites successfully.
- ✅ `backend-07-payments` completed:
  - Implemented Squad client wrapper for payout bank list, account lookup, transfer initiation, transfer status, and virtual account creation.
  - Implemented payments services for salary disbursement, advance request, amount conversion (`naira_to_kobo`), and transaction reference generation.
  - Implemented payments APIs: banks, bank registration/mine, worker payment snapshot, advance request/history, HR team summary, release held disbursement, transfer status, Squad webhook endpoint.
  - Implemented webhook processing helpers (signature verification + status reconciliation for disbursement/advance references).
  - Added squad client/service/view tests and re-ran targeted + full backend test suites successfully.
- ▶️ Next ready tasks: `backend-06-reports` and `backend-08-webhooks` (reports first is preferred sequencing).