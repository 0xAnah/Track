# ============================================================
# API ENDPOINTS — COMPLETE REFERENCE (UPDATED)
# Django REST Framework ViewSets + APIViews
# ============================================================

# ============================================================
# MISSING ENDPOINTS ADDED (from Track_PROJECT.md)
# ============================================================
#
#  USERS (ADDED)
#   GET    /users/banks/                 (Auth — live bank list from Squad)
#
#  ATTENDANCE (ADDED)
#   GET    /attendance/my-history/       (Worker — monthly attendance history)
#
#  PAYMENTS (ADDED)
#   GET    /payments/banks/              (Auth — live bank list from Squad)
#   POST   /payments/bank-account/register/ (Worker — register + verify bank account)
#   GET    /payments/bank-account/mine/  (Worker — view registered account details)
#   GET    /payments/mine/               (Worker — salary status + tier + advance eligibility)
#   POST   /payments/advance/request/    (Worker — request salary advance)
#   GET    /payments/advance/history/    (Worker — advance requests + repayment status)
#   GET    /payments/team/summary/       (HR only — team payment breakdown)
#   POST   /payments/release/{id}/       (HR only — release held salary)
#   POST   /payments/webhook/squad/      (PUBLIC — Squad webhook callback)
#   GET    /payments/transfer-status/{ref}/ (HR only — transfer status lookup)
#
# ============================================================
# URL summary (all prefixed with /api/v1/):
#
#  AUTH
#   POST   /auth/login/
#   POST   /auth/refresh/
#   POST   /auth/logout/
#
#  USERS
#   GET    /users/me/
#   GET    /users/workers/              (HR only — list my workers)
#   POST   /users/workers/assign/       (HR only — assign worker to HR)
#   GET    /users/{id}/                 (HR only)
#
#  ATTENDANCE
#   POST   /attendance/sign-in/
#   POST   /attendance/sign-out/
#   GET    /attendance/today/
#   GET    /attendance/worker/{id}/     (HR only)
#
#  LEAVE
#   POST   /leave/request/
#   GET    /leave/my-requests/
#   GET    /leave/pending/              (HR only)
#   PATCH  /leave/{id}/approve/         (HR only)
#   PATCH  /leave/{id}/reject/          (HR only)
#
#  DAILY LOGS
#   POST   /logs/submit/
#   GET    /logs/today/
#   GET    /logs/my-history/
#   GET    /logs/worker/{id}/           (HR only)
#   GET    /logs/worker/{id}/date/{date}/ (HR only)
#
#  SCORING
#   GET    /scores/mine/
#   GET    /scores/worker/{id}/         (HR only)
#   GET    /scores/team/                (HR only — all workers summary)
#   GET    /scores/deductions/{worker_id}/
#
#  REPORTS
#   GET    /reports/monthly/            (HR only — current month)
#   POST   /reports/generate/           (HR only — trigger generation)
#   GET    /reports/flagged/            (HR only — workers below 70)
#   PATCH  /reports/flagged/{id}/review/ (HR only — mark review complete)
#
# ============================================================
