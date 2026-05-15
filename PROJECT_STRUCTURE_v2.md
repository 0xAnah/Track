# VerifyForce — GitHub Project Structure (v2 with Squad Payments)

```
verifyforce/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py               # Shared settings, JWT config, Celery Beat schedule
│   │   │   ├── development.py        # DEBUG=True, SQLite option
│   │   │   └── production.py         # Env vars, Postgres, security headers
│   │   ├── urls.py                   # Root URL config — all /api/v1/ routes
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/
│   │   │
│   │   ├── users/                    # AUTH + USER MANAGEMENT
│   │   │   ├── models.py             # CustomUser, HRWorkerAssignment
│   │   │   ├── serializers.py        # UserSerializer, AssignmentSerializer
│   │   │   ├── views.py              # Login, logout, me, assign worker, list workers
│   │   │   ├── permissions.py        # IsHR, IsWorker, IsHROrReadOwn
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tests/
│   │   │       ├── test_models.py
│   │   │       └── test_views.py
│   │   │
│   │   ├── attendance/               # SIGN-IN / SIGN-OUT / LEAVE
│   │   │   ├── models.py             # AttendanceRecord, LeaveRequest
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Sign in, sign out, today, worker history,
│   │   │   │                         #   request leave, pending, approve, reject
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── logs/                     # DAILY TASK LOGS
│   │   │   ├── models.py             # DailyLog, TaskEntry
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Submit log, today log, history, HR views
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── scoring/                  # INTEGRITY SCORE ENGINE
│   │   │   ├── models.py             # MonthlyScore, ScoreDeduction
│   │   │   ├── serializers.py
│   │   │   ├── services.py           # apply_deduction(), get_or_create_score()
│   │   │   │                         # get_tier_for_score(), DEDUCTION_CONFIG
│   │   │   ├── views.py              # My score, worker score, team scores, deductions
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── reports/                  # END-OF-MONTH REPORTING
│   │   │   ├── models.py             # MonthlyReport, FlaggedWorker
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Monthly report, generate, flagged list, mark review
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   └── payments/                 # SQUAD PAYMENTS + INCENTIVE SYSTEM
│   │       ├── models.py             # WorkerBankAccount, SalaryDisbursement,
│   │       │                         # SalaryAdvanceRequest, PerformanceTier
│   │       ├── serializers.py
│   │       ├── squad_client.py       # SquadClient wrapper (initiate_transfer,
│   │       │                         #   verify_bank_account, get_bank_list,
│   │       │                         #   create_virtual_account)
│   │       ├── services.py           # disburse_salary(), request_salary_advance()
│   │       │                         # naira_to_kobo(), TIER_CONFIG, generate_reference()
│   │       ├── views.py              # Register bank, banks list, payment status,
│   │       │                         #   advance request, advance history,
│   │       │                         #   team summary, release hold, webhook handler
│   │       ├── urls.py
│   │       ├── webhooks.py           # Squad webhook signature verification
│   │       └── tests/
│   │           ├── test_squad_client.py
│   │           ├── test_services.py
│   │           └── test_views.py
│   │
│   ├── ai_engine/                    # AI MODULE (no models/URLs — pure service layer)
│   │   ├── client.py                 # Anthropic API wrapper, get_client(), call_claude()
│   │   ├── prompts.py                # LOG_ANALYSIS_PROMPT, MONTHLY_SUMMARY_PROMPT
│   │   ├── analyzers.py              # analyze_log(), generate_monthly_summary()
│   │   └── tests/
│   │       └── test_analyzers.py
│   │
│   ├── tasks/                        # CELERY BACKGROUND JOBS
│   │   ├── __init__.py
│   │   ├── celery.py                 # Celery app + Beat schedule config
│   │   ├── scoring_tasks.py          # nightly_score_deduction() — runs 11pm Mon–Fri
│   │   ├── log_tasks.py              # ai_analyze_submitted_log(log_id) — on submit
│   │   ├── report_tasks.py           # generate_monthly_report_for_all_hr() — last day
│   │   └── payment_tasks.py          # end_of_month_salary_disbursement() — last day
│   │
│   └── utils/
│       ├── pagination.py             # StandardPagination (page_size=50)
│       └── responses.py              # success_response(), error_response() helpers
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       │
│       ├── api/                      # Axios API layer — one file per Django app
│       │   ├── client.js             # Axios instance, JWT interceptor, refresh logic
│       │   ├── auth.js               # login(), logout(), refreshToken()
│       │   ├── attendance.js         # signIn(), signOut(), requestLeave()
│       │   ├── logs.js               # submitLog(), getTodayLog(), getHistory()
│       │   ├── scoring.js            # getMyScore(), getTeamScores()
│       │   └── payments.js           # registerBank(), requestAdvance(), getPaymentStatus()
│       │
│       ├── pages/
│       │   ├── hr/
│       │   │   ├── Dashboard.jsx     # Overview: team scores, alerts, today attendance
│       │   │   ├── WorkerDetail.jsx  # Single worker: logs, score history, payment
│       │   │   ├── LeaveApproval.jsx # Pending leave requests queue
│       │   │   ├── MonthlyReport.jsx # Flagged workers list, release salary hold
│       │   │   └── TeamPayments.jsx  # Payment summary, bonuses, advances
│       │   │
│       │   └── worker/
│       │       ├── Home.jsx          # Dashboard: today status, score, tier badge
│       │       ├── DailyLog.jsx      # Task entry form with chain fields
│       │       ├── MyScore.jsx       # Score breakdown, deduction history
│       │       ├── LeaveRequest.jsx  # Submit leave, view leave history
│       │       └── Payments.jsx      # Salary status, tier, advance request form
│       │
│       ├── components/
│       │   ├── ScoreBar.jsx          # Animated score bar with tier colour
│       │   ├── TierBadge.jsx         # Elite / Solid / Standard / Flagged pill
│       │   ├── TaskChainForm.jsx     # Task entry with initiated_by + handed_to
│       │   ├── AlertBanner.jsx       # AI flag alerts
│       │   └── PaymentStatusCard.jsx # Shows salary, bonus, advance deduction
│       │
│       ├── context/
│       │   └── AuthContext.jsx       # User, role, token state
│       │
│       └── hooks/
│           ├── useAuth.js
│           ├── useScore.js
│           └── usePayments.js
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml            # pytest on every PR to main
│       └── frontend-ci.yml           # ESLint + Vite build check
│
├── docs/
│   ├── api-reference.md              # All endpoints with request/response examples
│   ├── architecture.md               # System diagram description
│   ├── scoring-rules.md              # Point deduction table and thresholds
│   └── squad-integration.md          # Squad API setup, sandbox keys, webhook config
│
├── .gitignore
└── README.md
```

---

## Key decisions explained

### `payments/` is a full Django app
Unlike `ai_engine/` which is a pure service module, `payments/` has its own models
(`WorkerBankAccount`, `SalaryDisbursement`, `SalaryAdvanceRequest`), URL routes,
and a dedicated `squad_client.py`. This is because payment data is financial-grade
and needs its own audit trail separate from scoring.

### `squad_client.py` is isolated
All HTTP calls to Squad live in one file. If Squad changes their API or you need
to swap to another provider, you only touch one file. Views and tasks call
`services.py`; services call `squad_client.py`. Views never call Squad directly.

### Four Celery tasks, each single-purpose
- `nightly_score_deduction` — runs every night, checks attendance + logs
- `ai_analyze_submitted_log` — triggered on log submit (not scheduled)
- `generate_monthly_report_for_all_hr` — last working day of month
- `end_of_month_salary_disbursement` — runs after the report, pays or holds

### Frontend `payments.js` API file
All Squad-related frontend calls go through this one file so the rest of the
React code never knows what payment provider is being used.

### Webhook handler
Squad sends a POST callback when a transfer completes or fails. This hits
`/api/v1/payments/webhook/squad/` which verifies the Squad signature header
and updates the `SalaryDisbursement` status accordingly. Never update payment
status only from your own outbound call — always confirm via webhook.
