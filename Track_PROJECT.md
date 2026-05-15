# Track — Complete Project Documentation

> **Hackathon submission for GTBank Nigeria Fintech Hackathon**
> Built on Squad by GTBank · Powered by Anthropic Claude AI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Summary](#3-solution-summary)
4. [Key Features](#4-key-features)
5. [Financial Innovation](#5-financial-innovation)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [GitHub Project Structure](#8-github-project-structure)
9. [Database Models](#9-database-models)
10. [API Endpoints](#10-api-endpoints)
11. [AI Engine](#11-ai-engine)
12. [Scoring System](#12-scoring-system)
13. [Squad Payment Integration](#13-squad-payment-integration)
14. [Performance Tier System](#14-performance-tier-system)
15. [Background Jobs & Automation](#15-background-jobs--automation)
16. [Frontend Pages](#16-frontend-pages)
17. [Setup & Installation](#17-setup--installation)
18. [Environment Variables](#18-environment-variables)
19. [Security Considerations](#19-security-considerations)
20. [Future Roadmap](#20-future-roadmap)

---

## 1. Project Overview

**Track** is an AI-powered workforce integrity and payroll automation platform designed for large Nigerian government parastatals and corporations. It solves the long-standing ghost worker crisis by combining daily behavioural monitoring, AI-driven log analysis, and automated salary disbursement through **Squad by GTBank**.

The system creates an accountable, fully auditable trail for every worker's daily activity — what they did, who assigned it, who received it — and uses this data to score each worker monthly. Only workers who can prove they are genuine, productive employees receive their salary automatically. Workers who cannot are flagged and required to appear physically before their HR before any payment is released.

| Property | Detail |
|---|---|
| **Project name** | VerifyForce |
| **Hackathon** | GTBank Nigeria Fintech Hackathon |
| **Payment partner** | Squad by GTBank |
| **AI provider** | Anthropic (Claude Sonnet) |
| **Backend** | Django REST Framework |
| **Frontend** | React (Vite + Tailwind) |
| **Database** | PostgreSQL |
| **Job queue** | Celery + Redis |
| **Deployment** | Docker + Gunicorn |

---

## 2. Problem Statement

Ghost workers cost the Nigerian government an estimated **₦200 billion annually**. They are employees on the payroll who do not exist, do not show up, or have died — yet continue to receive salaries because there is no continuous verification mechanism between payroll and actual daily work output.

Existing solutions rely on periodic audits, biometric registration drives, or one-time verification exercises. These are:

- **Easily gamed** — a ghost worker's sponsor can present someone for the audit and then go back to collecting
- **Infrequent** — annual or biannual exercises miss months of fraudulent payments
- **Disconnected from work** — they verify existence but not productivity
- **Not financial-grade** — salary payment continues regardless of audit findings

The result is that even when ghost workers are identified, they have already been paid for months or years before discovery.

---

## 3. Solution Summary

VerifyForce creates a **continuous, daily accountability loop** that ties salary payment directly to verified daily work output. The loop works as follows:

1. **Workers sign in and out** of the system every working day
2. **Workers file a daily task log** detailing every task completed, who assigned it, and who received the output
3. **The AI analyses every log** for completeness, consistency, and anomalies
4. **Points are deducted automatically** for absences, missing logs, and broken task chains
5. **Each worker's monthly score** determines their salary payment outcome
6. **Workers above 70 points** are paid automatically via Squad at month-end
7. **Workers below 70 points** have their salary held — their HR receives a report and must conduct a physical identity verification before releasing payment
8. **High-performing workers** receive performance bonuses and access to mid-month salary advances — both disbursed instantly via Squad

---

## 4. Key Features

### For HR personnel

| Feature | Description |
|---|---|
| **Worker assignment** | Each HR manages a specific pool of workers. They can reassign workers within the system. |
| **Real-time dashboard** | Live view of team attendance, scores, AI alerts, and sign-in status |
| **Daily log viewer** | HR can inspect any worker's log on any date, including AI analysis verdict |
| **Leave approval queue** | Workers request leave; HR approves or rejects. Approved leave prevents score deductions. |
| **Monthly integrity report** | AI-generated end-of-month report listing all flagged workers with deduction reasons |
| **Physical review workflow** | HR records the outcome of physical verification before releasing held salaries |
| **Team payment dashboard** | Full visibility into who has been paid, who is held, bonus amounts, and advance deductions |
| **Manual salary release** | HR can release a held salary via Squad after completing physical verification |

### For workers

| Feature | Description |
|---|---|
| **Daily sign-in / sign-out** | Time-stamped attendance record with late detection |
| **Daily task log** | Workers file task entries with title, description, time range, task initiator, and task handover |
| **Leave request** | Workers can request leave with reason; the system tracks approval status |
| **Score dashboard** | Workers see their current score, tier, deduction history, and AI feedback on each log |
| **Salary preview** | Workers can see their estimated net pay including tier bonuses and advance deductions |
| **Salary advance** | Eligible workers (80+ pts) can request an instant mid-month advance via Squad |
| **Bank account registration** | Workers register their bank account; Squad verifies it before any payment is processed |

---

## 5. Financial Innovation

VerifyForce introduces three financial innovations built on top of Squad by GTBank:

### 5.1 Performance-linked automated payroll

Salary disbursement is not manual. At month-end, the system automatically:
- Calculates each worker's net pay based on their performance tier
- Initiates Squad transfers for all workers above 70 points
- Holds salary programmatically for flagged workers

This eliminates the administrative bottleneck of manual salary processing and ensures payment accuracy is tied to verified output.

### 5.2 Tier-based performance bonuses

Workers are placed into one of four performance tiers based on their monthly integrity score. Higher tiers earn automatic cash bonuses paid on top of base salary via Squad:

| Tier | Score range | Bonus | Advance eligibility |
|---|---|---|---|
| Elite | 90 – 100 | +2% of base salary | Up to 50% salary advance |
| Solid | 80 – 89 | +1% of base salary | Up to 30% salary advance |
| Standard | 70 – 79 | None | Not eligible |
| Flagged | Below 70 | None | Not eligible · Salary held |

Bonuses are automatically calculated and included in the Squad transfer at month-end. This is the first time performance bonuses in government/parastatal settings would be automated and directly tied to real work output rather than subjective appraisal.

### 5.3 Earned wage access (salary advance)

Workers in the Solid or Elite tier can request a salary advance mid-month, instantly disbursed to their bank account via Squad. The advance is automatically repaid by deducting it from their end-of-month salary — no paperwork, no chasing.

This solves a critical pain point for Nigerian civil servants who often face financial hardship mid-month. It also incentivises workers to maintain high integrity scores to retain advance eligibility — creating a positive reinforcement loop between good work habits and financial access.

**Why this matters for GTBank:** Every salary advance is a micro-lending product delivered through Squad. The bank earns float, builds a payment relationship with workers, and creates a pathway to offer savings accounts, insurance, and other financial products to the verified workforce.

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│   HR Portal (React)   Worker App (PWA)   Admin (Django admin)  │
│                        Squad Webhooks                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / JWT
┌───────────────────────────▼─────────────────────────────────────┐
│              DJANGO REST FRAMEWORK — API GATEWAY                │
│            JWT auth · rate limiting · /api/v1/                  │
└──────┬──────────┬───────────┬───────────┬───────────┬──────────┘
       │          │           │           │           │
┌──────▼──┐ ┌────▼────┐ ┌────▼───┐ ┌────▼────┐ ┌───▼──────┐
│  users  │ │attend.  │ │  logs  │ │ scoring │ │ payments │
│ Auth    │ │Sign in  │ │Task    │ │Monthly  │ │Bank acct │
│ Roles   │ │Sign out │ │entries │ │score    │ │Disburse  │
│ HR/     │ │Leave    │ │Chain   │ │Deduct.  │ │Advance   │
│ worker  │ │approval │ │verify  │ │Tier     │ │Squad     │
│ assign  │ │Absence  │ │AI flag │ │engine   │ │client    │
└─────────┘ └─────────┘ └────────┘ └─────────┘ └──────────┘
       │                     │           │
┌──────▼─────────────┐ ┌─────▼───────────▼────────────────────┐
│   AI ENGINE        │ │         POSTGRESQL DATABASE           │
│   Anthropic API    │ │  Users · Attendance · DailyLogs       │
│   analyze_log()    │ │  Scores · Deductions · Reports        │
│   detect_anomaly() │ │  BankAccounts · Disbursements         │
│   monthly_summary()│ │  AdvanceRequests · FlaggedWorkers     │
└──────┬─────────────┘ └──────────────────────────────────────┘
       │
┌──────▼───────────────────────────────────────────────────────┐
│           BACKGROUND JOBS — CELERY + REDIS                   │
│  Nightly scorer  │  Log analyser  │  Monthly report  │  Salary│
│  11pm Mon–Fri    │  On submit     │  Last day/month  │  disburse│
└──────────────────────────────────────────────────────────────┘
       │
┌──────▼───────────────────────────────────────────────────────┐
│              SQUAD API LAYER — GT BANK SUBSIDIARY            │
│  Auto salary  │  Tier bonuses  │  Salary advance  │  Webhooks │
│  Score ≥ 70   │  Elite +2%     │  Instant payout  │  Confirm  │
│  Score < 70   │  Solid +1%     │  Deducted EOM    │  transfer │
│  → held       │  Paid via API  │  30–50% limit    │  status   │
└──────────────────────────────────────────────────────────────┘
```

### Architecture principles

- **Separation of concerns** — every Django app owns one domain. The `payments` app is the only code that touches Squad. The `ai_engine` module is the only code that calls Anthropic.
- **Immutable audit trail** — `ScoreDeduction` records are append-only. No deduction is ever deleted. This creates a court-admissible record.
- **Webhook-first payment confirmation** — the system never trusts its own outbound API call to Squad. Payment status is only updated to `success` when Squad's webhook callback arrives and its HMAC signature is verified.
- **AI as advisor, not judge** — the AI engine flags and recommends deductions, but all deduction records are logged with `applied_by` (system or AI), creating accountability for automated decisions.
- **Async everything** — AI analysis and salary disbursement run in Celery workers so HTTP responses stay fast. Workers get instant confirmation their log was received; analysis arrives asynchronously.

---

## 7. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| **Backend framework** | Django 5.0 + Django REST Framework 3.15 | Mature, batteries-included, excellent admin panel for oversight |
| **Authentication** | djangorestframework-simplejwt | JWT with refresh token rotation and blacklisting |
| **Database** | PostgreSQL 16 | ACID compliance for financial data, JSON field support |
| **Task queue** | Celery 5.4 + Redis 7 | Reliable async job execution with scheduled beat tasks |
| **AI / LLM** | Anthropic Claude Sonnet (`claude-sonnet-4-20250514`) | Best-in-class instruction following for structured JSON analysis |
| **Payment API** | Squad by GTBank | Nigerian fintech, instant transfers, account verification, webhooks |
| **Frontend** | React 18 + Vite + Tailwind CSS | Fast builds, component reuse across HR and worker portals |
| **HTTP client** | Axios | Interceptors for JWT injection and token refresh |
| **Web server** | Gunicorn | Production-grade WSGI server |
| **Containerisation** | Docker + docker-compose | Reproducible environment for all services |
| **CI/CD** | GitHub Actions | Run tests and lint on every pull request |
| **Settings management** | django-environ | 12-factor environment variable config |
| **CORS** | django-cors-headers | Allow frontend domain to call the API |

---

## 8. GitHub Project Structure

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
│   │   │   ├── base.py               # Shared settings, JWT, Celery Beat schedule
│   │   │   ├── development.py        # DEBUG=True, relaxed CORS
│   │   │   └── production.py         # Env vars only, strict security headers
│   │   ├── urls.py                   # Root URL config — all /api/v1/ routes
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/
│   │   ├── users/
│   │   │   ├── models.py             # CustomUser, HRWorkerAssignment
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Login, logout, me, assign worker, list workers
│   │   │   ├── permissions.py        # IsHR, IsWorker, IsHROrReadOwn
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tests/
│   │   │
│   │   ├── attendance/
│   │   │   ├── models.py             # AttendanceRecord, LeaveRequest
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── logs/
│   │   │   ├── models.py             # DailyLog, TaskEntry
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── scoring/
│   │   │   ├── models.py             # MonthlyScore, ScoreDeduction
│   │   │   ├── serializers.py
│   │   │   ├── services.py           # apply_deduction(), get_tier_for_score()
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── reports/
│   │   │   ├── models.py             # MonthlyReport, FlaggedWorker
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   └── payments/
│   │       ├── models.py             # WorkerBankAccount, SalaryDisbursement,
│   │       │                         #   SalaryAdvanceRequest, PerformanceTier
│   │       ├── serializers.py
│   │       ├── squad_client.py       # SquadClient — all HTTP calls to Squad API
│   │       ├── services.py           # disburse_salary(), request_salary_advance()
│   │       ├── views.py
│   │       ├── webhooks.py           # Squad HMAC signature verification
│   │       ├── urls.py
│   │       └── tests/
│   │
│   ├── ai_engine/                    # Pure service module — no models, no URLs
│   │   ├── client.py                 # get_client(), call_claude()
│   │   ├── prompts.py                # LOG_ANALYSIS_PROMPT, MONTHLY_SUMMARY_PROMPT
│   │   ├── analyzers.py              # analyze_log(), generate_monthly_summary()
│   │   └── tests/
│   │
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── celery.py                 # Celery app + Beat schedule
│   │   ├── scoring_tasks.py          # nightly_score_deduction()
│   │   ├── log_tasks.py              # ai_analyze_submitted_log(log_id)
│   │   ├── report_tasks.py           # generate_monthly_report_for_all_hr()
│   │   └── payment_tasks.py          # end_of_month_salary_disbursement()
│   │
│   └── utils/
│       ├── pagination.py
│       └── responses.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   ├── client.js             # Axios instance + JWT interceptor + refresh
│       │   ├── auth.js
│       │   ├── attendance.js
│       │   ├── logs.js
│       │   ├── scoring.js
│       │   └── payments.js
│       ├── pages/
│       │   ├── hr/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── WorkerDetail.jsx
│       │   │   ├── LeaveApproval.jsx
│       │   │   ├── MonthlyReport.jsx
│       │   │   └── TeamPayments.jsx
│       │   └── worker/
│       │       ├── Home.jsx
│       │       ├── DailyLog.jsx
│       │       ├── MyScore.jsx
│       │       ├── LeaveRequest.jsx
│       │       └── Payments.jsx
│       ├── components/
│       │   ├── ScoreBar.jsx
│       │   ├── TierBadge.jsx
│       │   ├── TaskChainForm.jsx
│       │   ├── AlertBanner.jsx
│       │   └── PaymentStatusCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── hooks/
│           ├── useAuth.js
│           ├── useScore.js
│           └── usePayments.js
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── docs/
│   ├── api-reference.md
│   ├── architecture.md
│   ├── scoring-rules.md
│   └── squad-integration.md
│
├── .gitignore
└── README.md
```

---

## 9. Database Models

### `users` app

#### `CustomUser`
Extends Django's `AbstractUser`. Adds `role` (hr or worker), `department`, `employee_id`, and `phone`.

| Field | Type | Notes |
|---|---|---|
| `role` | CharField | `hr` or `worker` |
| `department` | CharField | Ministry or department name |
| `employee_id` | CharField (unique) | Government employee number |
| `phone` | CharField | |
| `is_active` | BooleanField | Soft delete support |

#### `HRWorkerAssignment`
Maps each worker (one-to-one) to their responsible HR personnel.

| Field | Type | Notes |
|---|---|---|
| `hr` | FK → CustomUser | Must have role=hr |
| `worker` | OneToOne → CustomUser | Must have role=worker |
| `assigned_at` | DateTimeField | Auto |

---

### `attendance` app

#### `AttendanceRecord`
One record per worker per working day.

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `date` | DateField | Unique with worker |
| `sign_in_time` | DateTimeField | Nullable |
| `sign_out_time` | DateTimeField | Nullable |
| `is_absent` | BooleanField | |
| `absence_excused` | BooleanField | True when approved leave covers this day |
| `notes` | TextField | |

#### `LeaveRequest`

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `start_date` | DateField | |
| `end_date` | DateField | |
| `reason` | TextField | |
| `status` | CharField | pending / approved / rejected |
| `reviewed_by` | FK → CustomUser | The HR who actioned it |
| `reviewed_at` | DateTimeField | |
| `hr_notes` | TextField | |

---

### `logs` app

#### `DailyLog`
One log per worker per day. Contains multiple `TaskEntry` records.

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `date` | DateField | Unique with worker |
| `status` | CharField | draft / submitted / verified / flagged |
| `ai_analysis` | TextField | AI's written verdict |
| `ai_score_impact` | IntegerField | Negative integer = deduction applied |
| `submitted_at` | DateTimeField | |

#### `TaskEntry`
A single task within a `DailyLog`. The core accountability unit.

| Field | Type | Notes |
|---|---|---|
| `daily_log` | FK → DailyLog | |
| `title` | CharField | |
| `description` | TextField | |
| `initiated_by` | CharField | Name/role of who assigned this task |
| `handed_to` | CharField | Name/role of who received the output |
| `start_time` | TimeField | |
| `end_time` | TimeField | |
| `is_chain_complete` | BooleanField | Set by AI |
| `ai_flag_reason` | TextField | Set when AI flags this specific task |

---

### `scoring` app

#### `MonthlyScore`
One record per worker per month. Resets to 100 at the start of each month.

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `year` | IntegerField | |
| `month` | IntegerField | 1–12 |
| `current_score` | IntegerField | Default 100 |
| `is_flagged` | BooleanField | True when score drops below 70 |
| `flagged_at` | DateTimeField | |

#### `ScoreDeduction`
Immutable audit record of every deduction ever applied. Never deleted.

| Field | Type | Notes |
|---|---|---|
| `monthly_score` | FK → MonthlyScore | |
| `reason` | CharField | One of 5 defined reason codes |
| `points_deducted` | IntegerField | |
| `detail` | TextField | Human/AI readable explanation |
| `applied_at` | DateTimeField | Auto |
| `applied_by` | CharField | `system` or `ai` |

---

### `reports` app

#### `MonthlyReport`
Generated once per HR per month by the Celery task.

| Field | Type | Notes |
|---|---|---|
| `hr` | FK → CustomUser | The HR this report belongs to |
| `year` | IntegerField | |
| `month` | IntegerField | |
| `total_workers` | IntegerField | |
| `flagged_count` | IntegerField | Workers below 70 |
| `summary` | TextField | AI-generated narrative paragraph |

#### `FlaggedWorker`
Each flagged worker entry in a `MonthlyReport`.

| Field | Type | Notes |
|---|---|---|
| `report` | FK → MonthlyReport | |
| `worker` | FK → CustomUser | |
| `final_score` | IntegerField | |
| `primary_reason` | TextField | Top deduction reason |
| `physical_review_required` | BooleanField | Always True initially |
| `review_completed` | BooleanField | Set by HR after physical verification |
| `review_notes` | TextField | HR records the outcome |

---

### `payments` app

#### `WorkerBankAccount`

| Field | Type | Notes |
|---|---|---|
| `worker` | OneToOne → CustomUser | |
| `account_number` | CharField | |
| `bank_code` | CharField | Nigerian bank code |
| `bank_name` | CharField | Returned by Squad account lookup |
| `account_name` | CharField | Verified by Squad |
| `monthly_salary` | DecimalField | Set during registration |
| `is_verified` | BooleanField | True after Squad account lookup succeeds |

#### `SalaryDisbursement`
One record per worker per month. The source of truth for payment status.

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `year` | IntegerField | |
| `month` | IntegerField | |
| `base_salary` | DecimalField | |
| `bonus_amount` | DecimalField | Based on tier |
| `advance_deduction` | DecimalField | Outstanding advance repayment |
| `net_amount` | DecimalField | What is actually sent to the bank |
| `performance_tier` | CharField | elite / solid / standard / flagged |
| `integrity_score` | IntegerField | Score at time of disbursement |
| `squad_reference` | CharField (unique) | Used to track the Squad transaction |
| `squad_response` | JSONField | Raw Squad API response |
| `status` | CharField | pending / success / failed / held |
| `held_reason` | TextField | Populated when score < 70 |
| `paid_at` | DateTimeField | Set on Squad webhook confirmation |

#### `SalaryAdvanceRequest`

| Field | Type | Notes |
|---|---|---|
| `worker` | FK → CustomUser | |
| `year` | IntegerField | |
| `month` | IntegerField | |
| `requested_amount` | DecimalField | |
| `approved_amount` | DecimalField | May equal requested or less |
| `reason` | TextField | Worker-provided reason |
| `status` | CharField | pending / approved / disbursed / rejected / repaid |
| `score_at_request` | IntegerField | Score when advance was requested |
| `tier_at_request` | CharField | Tier at time of request |
| `squad_reference` | CharField (unique) | |
| `disbursed_at` | DateTimeField | |
| `repaid_at` | DateTimeField | Set when deducted from month-end salary |

---

## 10. API Endpoints

All endpoints are prefixed `/api/v1/`. All require JWT Bearer token unless marked PUBLIC.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login/` | PUBLIC | Returns access + refresh tokens and user role |
| POST | `/auth/refresh/` | PUBLIC | Returns new access token |
| POST | `/auth/logout/` | Auth | Blacklists the refresh token |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/me/` | Auth | Authenticated user's full profile |
| GET | `/users/workers/` | HR only | All workers assigned to this HR with current scores |
| GET | `/users/workers/{id}/` | HR only | Single worker full profile |
| POST | `/users/workers/assign/` | HR only | Assign a worker to this HR |
| GET | `/users/banks/` | Auth | Live Nigerian bank list from Squad |

### Attendance

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/attendance/sign-in/` | Worker | Records sign-in time. Returns `is_late` flag. |
| POST | `/attendance/sign-out/` | Worker | Records sign-out time |
| GET | `/attendance/today/` | Worker | Today's attendance record |
| GET | `/attendance/my-history/` | Worker | Monthly attendance history |
| GET | `/attendance/worker/{id}/` | HR only | Worker's attendance for a given month |

### Leave

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/leave/request/` | Worker | Submit a leave request |
| GET | `/leave/my-requests/` | Worker | Own leave request history |
| GET | `/leave/pending/` | HR only | All pending requests for managed workers |
| PATCH | `/leave/{id}/approve/` | HR only | Approve + mark attendance as excused |
| PATCH | `/leave/{id}/reject/` | HR only | Reject the request |

### Daily Logs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/logs/submit/` | Worker | Submit today's task log. Triggers AI analysis async. |
| GET | `/logs/today/` | Worker | Today's log including AI verdict |
| GET | `/logs/my-history/` | Worker | Monthly log summary |
| GET | `/logs/worker/{id}/` | HR only | Worker's logs for a given month |
| GET | `/logs/worker/{id}/date/{date}/` | HR only | Full task detail for a specific day |

### Scoring

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/scores/mine/` | Worker | Current score, tier, deduction history |
| GET | `/scores/worker/{id}/` | HR only | A specific worker's score breakdown |
| GET | `/scores/team/` | HR only | All managed workers' scores with tier breakdown |
| GET | `/scores/deductions/{id}/` | HR only | Full deduction audit trail for a worker |

### Reports

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/monthly/` | HR only | Current month's integrity report |
| POST | `/reports/generate/` | HR only | Manually trigger report generation |
| PATCH | `/reports/flagged/{id}/review/` | HR only | Record physical review outcome |

### Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/payments/banks/` | Auth | Live bank list from Squad |
| POST | `/payments/bank-account/register/` | Worker | Register + Squad-verify bank account |
| GET | `/payments/bank-account/mine/` | Worker | View registered account details |
| GET | `/payments/mine/` | Worker | Salary status, tier, advance eligibility |
| POST | `/payments/advance/request/` | Worker | Request instant mid-month advance via Squad |
| GET | `/payments/advance/history/` | Worker | All advance requests and repayment status |
| GET | `/payments/team/summary/` | HR only | Full team payment breakdown |
| POST | `/payments/release/{id}/` | HR only | Release a held salary via Squad after review |
| POST | `/payments/webhook/squad/` | PUBLIC (HMAC verified) | Squad payment confirmation webhook |
| GET | `/payments/transfer-status/{ref}/` | HR only | Live Squad transfer status lookup |

---

## 11. AI Engine

The AI engine is a pure service module (`ai_engine/`) with no Django models or URL routes. It is called only from Celery tasks and never directly from HTTP views.

### Log analysis (`analyze_log`)

Every submitted daily log is sent to Claude Sonnet for analysis. The AI receives:

- Worker name and date
- Every task entry: title, description, time range, `initiated_by`, `handed_to`

Claude evaluates:
1. Does every task have a clear, named initiator?
2. Does every task have a clear, named handover target?
3. Are time ranges realistic and non-overlapping?
4. Is the total work volume plausible for one person in a working day?
5. Are descriptions specific or suspiciously vague (a sign of fabrication)?

Claude responds in structured JSON:

```json
{
  "verdict": "verified | flagged | suspicious",
  "score_impact": 0,
  "chain_issues": ["Task title: reason for flag"],
  "summary": "One sentence verdict.",
  "deduction_reason": "incomplete_chain | ai_anomaly | missing_log | null"
}
```

The Celery task reads this response, updates the `DailyLog` status, marks individual `TaskEntry` records as flagged or verified, and calls `apply_deduction()` if `score_impact` is negative.

### Monthly summary (`generate_monthly_summary`)

At the end of each month, Claude receives a list of all flagged workers (score, primary deduction reason) and generates a professional 3–5 sentence HR briefing paragraph. This appears in the `MonthlyReport` and is shown to the HR on the monthly report page.

### Why Claude Sonnet

Claude Sonnet was chosen for its superior instruction-following and ability to return consistent, parseable JSON. The system prompts are strict: Claude is instructed to return only JSON with no preamble, markdown, or prose. Sonnet reliably respects this constraint across thousands of calls.

---

## 12. Scoring System

### Monthly cycle

- Scores reset to **100** on the 1st of every month
- Deductions accumulate throughout the month
- The month-end report and salary run use the score as of the last working day
- All `ScoreDeduction` records are permanent (immutable audit trail)

### Deduction table

| Reason code | Trigger | Points deducted |
|---|---|---|
| `unexcused_absence` | Worker has no sign-in record and no approved leave for the day | −12 per day |
| `missing_log` | Worker signed in but did not submit a daily log | −8 per day |
| `incomplete_chain` | AI flags a task for missing `initiated_by` or `handed_to` | −5 per flagged task |
| `late_signin_pattern` | Worker accumulates 5 or more late sign-ins in the same month | −5 (once per month) |
| `ai_anomaly` | AI detects fabricated content, overlapping times, or implausible work volume | −10 per flagged log |

### Thresholds

| Score range | Outcome |
|---|---|
| 90 – 100 | Elite tier · Auto-paid with +2% bonus · 50% advance limit |
| 80 – 89 | Solid tier · Auto-paid with +1% bonus · 30% advance limit |
| 70 – 79 | Standard tier · Auto-paid · No bonus · No advance |
| 0 – 69 | Flagged · Salary held · Physical review required before payment |

### Score adjustment

Scores cannot go below 0. The `apply_deduction()` service enforces this:

```python
actual_deduction = min(points, score.current_score)
score.current_score = max(0, score.current_score - actual_deduction)
```

HR can manually adjust a score via the Django admin panel in exceptional cases (e.g. a technical failure that wrongly deducted points). All manual adjustments are logged.

---

## 13. Squad Payment Integration

Squad is the payment infrastructure powering all financial flows in VerifyForce. All Squad interactions are routed through `apps/payments/squad_client.py` — the only file in the project that makes HTTP calls to Squad.

### Squad API calls used

| Squad endpoint | Used for |
|---|---|
| `POST /payout/initiate_transfer` | Salary payments, bonuses, salary advances |
| `GET /payout/transaction/{ref}` | Check transfer status |
| `POST /payout/account/lookup` | Verify worker's bank account before registration |
| `GET /payout/banks` | Fetch live Nigerian bank list for UI dropdown |
| `POST /virtual-account` | Create virtual account for worker advance wallet |

### Transaction reference convention

Every Squad transaction uses a structured reference for traceability:

```
VF-SAL-{worker_id}-{year}{month}    → salary disbursement
VF-ADV-{worker_id}-{year}{month}    → salary advance
VF-SAL-{worker_id}-{year}{month}-REL  → released held salary
```

### Webhook handling

Squad sends a POST callback to `/api/v1/payments/webhook/squad/` when a transfer completes or fails. The handler:

1. Reads the `x-squad-encrypted-body` header
2. Computes HMAC-SHA512 of the raw request body using `SQUAD_SECRET_KEY`
3. Rejects the request if signatures do not match (returns 200 anyway to prevent Squad retries)
4. Finds the matching `SalaryDisbursement` or `SalaryAdvanceRequest` by `squad_reference`
5. Updates status to `success` or `failed`

**Critical:** Payment status is only considered final after webhook confirmation. The outbound API call result is treated as provisional.

### Amount convention

Squad expects amounts in **kobo** (1 NGN = 100 kobo). The `naira_to_kobo()` helper converts all `Decimal` naira amounts before any API call:

```python
def naira_to_kobo(amount: Decimal) -> int:
    return int(amount * 100)
```

---

## 14. Performance Tier System

The tier system is defined in `TIER_CONFIG` in `apps/payments/models.py` and is the central configuration for all financial incentives:

```python
TIER_CONFIG = {
    "elite": {
        "label": "Elite",
        "min_score": 90,
        "bonus_percent": 2.0,
        "advance_limit_percent": 50,
    },
    "solid": {
        "label": "Solid",
        "min_score": 80,
        "bonus_percent": 1.0,
        "advance_limit_percent": 30,
    },
    "standard": {
        "label": "Standard",
        "min_score": 70,
        "bonus_percent": 0.0,
        "advance_limit_percent": 0,
    },
    "flagged": {
        "label": "Flagged",
        "min_score": 0,
        "bonus_percent": 0.0,
        "advance_limit_percent": 0,
    },
}
```

### End-of-month salary calculation

```
net_amount = base_salary + bonus - advance_deduction

where:
  bonus = base_salary × (bonus_percent / 100)
  advance_deduction = outstanding advance for this month (if any)
```

---

## 15. Background Jobs & Automation

All automated jobs run via **Celery Beat** — a scheduler that fires tasks at defined intervals.

### Celery Beat schedule

```python
CELERY_BEAT_SCHEDULE = {
    "nightly-scoring": {
        "task": "tasks.scoring_tasks.nightly_score_deduction",
        "schedule": crontab(hour=23, minute=0, day_of_week="1-5"),
        # Runs 11pm Mon–Fri
    },
    "monthly-report": {
        "task": "tasks.report_tasks.generate_monthly_report_for_all_hr",
        "schedule": crontab(hour=6, minute=0, day_of_month="28-31"),
        # Runs 6am on days 28–31 (catches all possible month-ends)
    },
    "salary-disbursement": {
        "task": "tasks.payment_tasks.end_of_month_salary_disbursement",
        "schedule": crontab(hour=8, minute=0, day_of_month="28-31"),
        # Runs 2 hours after report task
    },
}
```

### Task: `nightly_score_deduction`

Runs every weeknight. For each active worker:
1. Check if an `AttendanceRecord` exists for today
2. If absent and not on approved leave → deduct 12 pts (`unexcused_absence`)
3. If present but no `DailyLog` submitted → deduct 8 pts (`missing_log`)
4. Count late sign-ins this month → if exactly 5, deduct 5 pts (`late_signin_pattern`)

### Task: `ai_analyze_submitted_log`

Triggered immediately when a worker submits their daily log (not scheduled). Runs in a Celery worker:
1. Loads the `DailyLog` and all `TaskEntry` records
2. Calls `ai_engine.analyze_log(log)`
3. Updates `DailyLog.status`, `ai_analysis`, `ai_score_impact`
4. Updates each `TaskEntry.is_chain_complete` and `ai_flag_reason`
5. If AI found issues: calls `apply_deduction()`

### Task: `generate_monthly_report_for_all_hr`

Runs on the last days of each month. For each active HR:
1. Fetches all their workers' `MonthlyScore` records
2. Filters workers below 70 points
3. Creates or updates a `MonthlyReport` record
4. Creates `FlaggedWorker` records with primary deduction reason
5. Calls `generate_monthly_summary()` for the AI narrative paragraph
6. Marks all sub-70 scores as `is_flagged=True`

### Task: `end_of_month_salary_disbursement`

Runs 2 hours after the report task. For each active worker:
1. Checks their `MonthlyScore` for the current month
2. Gets their tier via `get_tier_for_score(score)`
3. Checks for outstanding `SalaryAdvanceRequest` to deduct
4. Calculates `net_amount = base_salary + bonus - advance_deduction`
5. If score < 70: creates a `SalaryDisbursement` with `status=held`
6. If score ≥ 70: calls `squad_client.initiate_transfer()` and creates `SalaryDisbursement` with `status=pending` (upgraded to `success` by webhook)

---

## 16. Frontend Pages

### HR portal pages

#### `Dashboard.jsx`
The landing page for HR after login. Shows:
- Monthly snapshot metrics (workers monitored, average score, flagged count, unexcused absences)
- Team worker list with inline score bars, today's sign-in status, and tier tags
- AI monitoring alerts (real-time flagged log analysis results)
- Today's sign-in summary

#### `WorkerDetail.jsx`
Accessed by clicking any worker from the dashboard. Shows:
- Worker profile card with tier badge and key metrics
- Full attendance calendar heatmap for the current month
- Daily log history table with AI status per day
- Today's task log with chain verification status per task
- Score breakdown with deduction history and AI analysis text

#### `LeaveApproval.jsx`
The leave queue for HR. Shows:
- All pending leave requests as expandable cards with worker details, dates, and reason
- HR notes input field on each card
- Approve and reject buttons (approve triggers attendance record update)
- Resolved leave history table

#### `MonthlyReport.jsx`
The payroll control centre. Shows:
- Report summary metrics (total, paid, held, reviews completed)
- AI-generated narrative summary paragraph
- Flagged worker cards with score, primary reason, HR review notes input, and salary release button
- Distinction between workers pending review and those already reviewed

#### `TeamPayments.jsx`
Full financial visibility for HR. Shows:
- Payment count summary (paid, held, failed)
- Bonus and advance totals
- Tier breakdown bar chart
- Squad transfer summary (successful, held, advance repayments, total disbursed)
- Full worker payment table with base, bonus, net, and status per worker

---

### Worker portal pages

#### `Home.jsx`
The worker's personal dashboard. Shows:
- Blue hero section with score, tier, and advance limit at a glance
- Today's status card (sign-in time, sign-out status, log filing status)
- Quick action buttons (file log, request leave, request advance, view score)
- HR contact card
- Recent deductions summary
- May payroll preview (base + bonus − advance = net estimate)

#### `DailyLog.jsx`
The core daily filing interface. Shows:
- Warning banner explaining chain field requirements
- Task entry cards with: title, description, time range, `initiated_by → handed_to` chain fields
- Per-task chain validation status badge
- Add task button
- Submit button (triggers async AI analysis)

#### `MyScore.jsx`
Full score transparency for the worker. Shows:
- Large score display with progress bar
- Three-cell summary (started 100 / deducted / current)
- Deduction history list with reason, date, applied-by, and points
- AI log feedback for each submitted log
- Tier progress ladder showing current tier and what's needed to move up
- Tips for improving score

#### `LeaveRequest.jsx`
The leave submission and history page. Shows:
- Leave request form (start date, end date, leave type dropdown, reason textarea)
- Excused absence protection notice
- Leave history list with status badges and HR notes
- Leave rules reference

#### `Payments.jsx`
Complete payment visibility and advance request for workers. Shows:
- Advance eligibility callout card (if eligible)
- May salary breakdown (base / bonus / advance deduction / net)
- Squad payment details and estimated pay date
- Bank account display with verification status
- Salary advance request form with tier limit calculation
- Advance history with disbursement and repayment dates

---

## 17. Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16
- Redis 7
- Docker (optional but recommended)

### Backend setup

```bash
# Clone the repository
git clone https://github.com/your-org/verifyforce.git
cd verifyforce/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment file
cp .env.example .env
# Edit .env — fill in database URL, Anthropic key, Squad keys, Redis URL

# Run migrations
python manage.py migrate

# Create a superuser (for Django admin)
python manage.py createsuperuser

# Run the development server
python manage.py runserver

# In a second terminal: start Celery worker
celery -A tasks.celery worker --loglevel=info

# In a third terminal: start Celery Beat scheduler
celery -A tasks.celery beat --loglevel=info
```

### Frontend setup

```bash
cd verifyforce/frontend
npm install
npm run dev
# Vite serves on http://localhost:5173
```

### Docker setup (all services)

```bash
cd verifyforce
docker-compose up --build
# Django API: http://localhost:8000
# Frontend: http://localhost:5173
# Django admin: http://localhost:8000/admin
```

---

## 18. Environment Variables

```env
# Django
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://verifyforce_user:password@localhost:5432/verifyforce_db

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Squad by GTBank
SQUAD_SECRET_KEY=sandbox_sk_...
SQUAD_PUBLIC_KEY=sandbox_pk_...

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS (frontend origin)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

For Squad sandbox testing, use keys from your [Squad dashboard](https://dashboard.squadco.com). Switch `SQUAD_SECRET_KEY` to the live key in production.

---

## 19. Security Considerations

| Area | Implementation |
|---|---|
| **Authentication** | JWT with 8-hour access tokens and 7-day rotating refresh tokens. Refresh tokens are blacklisted on logout. |
| **Authorisation** | Custom `IsHR` and `IsWorker` permission classes on every view. HR can only access workers assigned to them. |
| **Squad webhooks** | HMAC-SHA512 signature verification on every incoming webhook. Requests with invalid signatures are silently accepted but not processed (Squad retries on non-200). |
| **Financial data** | `SalaryDisbursement` and `ScoreDeduction` records are never updated after creation (append-only pattern). |
| **API keys** | All keys stored in `.env` only. Never committed. `django-environ` reads them at runtime. |
| **SQL injection** | Django ORM used throughout. No raw SQL queries. |
| **Rate limiting** | DRF throttling applied on auth endpoints to prevent brute force. |
| **CORS** | Only whitelisted frontend origins accepted. |
| **HTTPS** | Enforced in production via `SECURE_SSL_REDIRECT=True` in `production.py`. |

---

## 20. Future Roadmap

| Feature | Description |
|---|---|
| **GTBank savings integration** | Elite-tier bonus automatically split into a GTBank savings pot via Squad virtual account |
| **Biometric sign-in** | Replace time-based sign-in with face recognition or fingerprint via mobile camera |
| **WhatsApp notifications** | Workers receive their AI log verdict and deduction alerts via WhatsApp Business API |
| **Multi-HR hierarchy** | Department heads can oversee multiple HR managers and see aggregated reports |
| **Appeals workflow** | Workers can formally dispute an AI deduction; HR reviews and can reverse it |
| **Payslip generation** | Auto-generated PDF payslips delivered to workers after each Squad disbursement |
| **Audit export** | HR can export a full 12-month deduction audit trail as CSV or PDF for compliance |
| **Squad merchant vouchers** | Elite-tier workers receive Squad shopping vouchers redeemable at partner merchants |
| **Cross-ministry deployment** | Multi-tenant architecture allowing different ministries to run isolated instances |
| **Mobile app** | Native iOS and Android app for workers (currently a PWA) |

---

*VerifyForce — Built for the GTBank Fintech Hackathon · Powered by Squad & Anthropic Claude*

---

## 21. HR-Centric Company Signup Key Flow

To ensure every worker account is created under the correct HR/company context, onboarding follows an HR-first pattern:

1. **HR signup first**
   - HR creates an account with company details.
   - System generates a unique **worker signup key** for that HR.
   - The key is shown on the HR dashboard/profile (`/users/me/` payload includes it for HR users).

2. **Worker signup with HR key**
   - Worker signup requires the HR's worker signup key.
   - The key determines the target HR/company.
   - On successful signup, the worker is auto-linked to that HR (`HRWorkerAssignment`) and inherits the HR company context.

3. **Operational effect**
   - Worker activities (attendance, logs, scoring, reports, payments) are scoped to the HR they were keyed into at signup.
   - HR reporting pipelines and review flows therefore remain company/HR aligned by default.

### Auth endpoints added for this flow

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup/hr/` | PUBLIC | Create HR account with company info and auto-generate worker signup key |
| POST | `/auth/signup/worker/` | PUBLIC | Create worker account using HR signup key and auto-assign to that HR |
