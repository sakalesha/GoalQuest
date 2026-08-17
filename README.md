# GoalQuest — Enterprise Goal Setting & Tracking Portal

---

## Overview

GoalQuest is a role-based, full-lifecycle Goal Setting & Tracking Portal that replaces spreadsheet-driven and email-based performance management workflows. Employees draft goals within organizational cycles, managers approve or return them, quarterly check-ins auto-compute progress scores via four Unit-of-Measure (UoM) strategies, and admins govern cycle phases, audit overrides, and report generation — all backed by a single MongoDB cluster with JWT-authenticated REST APIs.

---

## Problem

Organizations relying on manual or fragmented goal-tracking methods — spreadsheets, email threads, offline review cycles — struggle with alignment, visibility, and accountability. Managers cannot see real-time progress, employees receive delayed feedback, HR teams cannot reconcile appraisal data, and critical compliance signals (who changed what, when a sheet was unlocked) are lost in a sea of unversioned documents.

---

## Solution

GoalQuest provides a structured digital platform that enforces the full goal lifecycle through a four-phase organizational cycle (`GOAL_SETTING → Q1 → Q2 → Q3 → Q4`), role-based access control (Employee, Manager, Admin), and server-side validation that guarantees data integrity at every stage.

The system integrates four key model choices:

- **MongoDB (Mongoose ODM)** as the data layer — flexible schema evolution for evolving goal attributes, native ObjectId references for Employee → Manager hierarchies, and embedded validation hooks (`pre('save')` for max-8-goals enforcement).
- **JWT + bcryptjs** for authentication — stateless 30-day tokens enable horizontal scaling on Vercel, while bcrypt with 10 salt rounds protects credentials.
- **Four UoM scoring strategies** (`MAX`, `MIN`, `TIMELINE`, `ZERO`) implemented as pure functions in `uomScore.js` — each produces a 0–1 progress score that feeds directly into weighted completion aggregates.
- **Mongoose lifecycle hooks** on `CheckIn` — a `post('save')` hook automatically syncs progress from a primary shared goal to all employee copies, eliminating the need for manual reconciliation.

The frontend (React 19 + Vite) consumes the REST API via Axios, stores auth state in Redux Toolkit slices persisted to `localStorage`, and uses Ant Design + Tailwind for responsive, role-aware dashboards. In development, Vite middleware is injected directly into the Express server (`server.ts`); in production, a static build is served from `dist/`.

---

## Features

- **Role-based authentication & access control** — Employee, Manager, and Admin roles with JWT tokens and bcrypt-hashed passwords
- **Multi-phase organizational cycles** — Admin creates cycles with phase transitions (`GOAL_SETTING → Q1 → Q2 → Q3 → Q4`); all goal/check-in actions are phase-gated
- **Goal sheet lifecycle management** — Draft → Submitted → Approved → Locked with explicit timestamps and return comments
- **Four Unit-of-Measure scoring types** — `MAX` (higher-is-better), `MIN` (lower-is-better), `TIMELINE` (date-bound), and `ZERO` (binary) with automated progress scoring
- **Weightage enforcement** — Per-goal minimum 10%, total must equal exactly 100% to submit; enforced via `validateWeightage` middleware
- **Shared goal broadcasting** — Managers push departmental KPIs to multiple employees simultaneously; shared goals default to 10% weight and auto-sync quarterly progress via Mongoose hooks
- **Quarterly check-ins** — Employees record actual achievements per quarter; system auto-calculates `progressScore` based on UoM type
- **Manager review dashboard** — Approve/submit/return team goal sheets with inline goal editing and manager commenting on check-ins
- **Admin cycle & user management** — Create cycles, transition phases, view all users, manually lock/unlock goal sheets
- **Audit logging** — All admin overrides on locked sheets are recorded with actor, action, old/new values for compliance
- **Excel achievement report export** — Admin/manager can export a formatted `.xlsx` workbook with per-employee, per-quarter achievement data
- **System & manager statistics** — Departmental completion rates, total goal counts, pending approval counts

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend Framework | React 19 (`react`, `react-dom`) | SPA with component-based UI |
| Frontend Build | Vite 6 (`vite`, `@vitejs/plugin-react`) | Dev server with HMR + production bundling |
| State Management | Redux Toolkit 2 + React Redux 9 | Centralized auth, goals, and cycles state |
| UI Components | Ant Design 6 (`antd`) | Role-aware forms, tables, modals |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | Utility-first styling |
| Icons | Lucide React | SVG icon library |
| Routing | React Router DOM 7 | Client-side routing with role guards |
| HTTP Client | Axios 1 | API communication with JWT interceptor |
| Date Handling | Day.js | Quarter and deadline formatting |
| Backend Framework | Express 4 (`express`) | REST API routing and middleware |
| API Error Handling | `express-async-errors` | Auto-catches async route errors |
| Database | MongoDB via Mongoose 9 (`mongoose`) | Document storage with schemas and hooks |
| Authentication | `jsonwebtoken`, `bcryptjs` | JWT issuance + 10-round password hashing |
| Export | `exceljs` | Excel workbook generation for reports |
| Environment | `dotenv` | `.env` file loading |
| CORS | `cors` | Cross-origin request handling |
| Server Runner (Dev) | `tsx` | TypeScript execution without compilation |
| Production Bundling | `esbuild` 0.25 | Bundles `server.ts` to CommonJS for Node |
| Deployment | Vercel (`vercel.json`) | Serverless function entry at `api/index.ts` |
| AI/ML (Reserved) | `@google/genai` | Installed; intended for future AI-assisted goal suggestions |
| Animation (Reserved) | `motion`, `recharts`, `d3` | Installed; not yet wired into UI |

---

## Architecture

```mermaid
graph TD
    subgraph Client["Frontend (SPA — Vite Dev / Static Build)"]
        A[React 19 App] --> B[Redux Toolkit Store]
        B --> C[Axios Interceptor — JWT]
        C --> D[Antd + Tailwind UI]
    end

    subgraph Gateway["API Layer (Express)"]
        E[server.ts / api/index.ts] --> F[cors + express.json]
        F --> G{Route Selector}
        G --> H[/api/auth]
        G --> I[/api/goal-sheets]
        G --> J[/api/goals]
        G --> K[/api/check-ins]
        G --> L[/api/admin]
        G --> M[/api/reports]
    end

    subgraph Middleware["Middleware Layer"]
        N[authenticate — JWT] --> O[requireRole — RBAC]
        O --> P[phaseGate — Cycle Phase]
        P --> Q[validateWeightage — 10% min / 100% total]
    end

    subgraph Controllers["Controller Layer"]
        R[authController]
        S[goalSheetController]
        T[goalController]
        U[checkInController]
        V[adminController]
        W[reportController]
    end

    subgraph Models["Model Layer (Mongoose)"]
        X[User]
        Y[Cycle]
        Z[GoalSheet]
        AA[Goal]
        AB[CheckIn]
        AC[AuditLog]
    end

    subgraph DB["Database (MongoDB Atlas)"]
        AD[(Cluster0 — atomquest)]
    end

    subgraph Utils["Utilities"]
        AE[uomScore.js — 4-strategy scoring]
        AF[auditLogger.js — audit trail]
        AG[exportHelper.js — Excel export]
        AH[seed.js — demo data]
    end

    subgraph External["External Services"]
        AI[Gemini API — @google/genai]
    end

    A -->|HTTP REST| E
    E --> F
    F --> G
    G --> N
    N --> O
    O --> P
    P --> Q
    Q --> R
    Q --> S
    Q --> T
    Q --> U
    L --> V
    M --> W
    R --> X
    S --> Z
    S --> Y
    T --> AA
    T --> Z
    U --> AB
    U --> AA
    V --> Y
    V --> X
    V --> AB
    W --> AA
    W --> AB
    W --> X
    W --> AG
    X --> AD
    Y --> AD
    Z --> AD
    AA --> AD
    AB --> AD
    AC --> AD
    AB -.->|pre-save hook| AE
    AB -.->|post-save hook| AB
    AC -.->|createAuditEntry| AF
```

### Request Flow (Update Goal Progress as Employee)

1. **Client** — Employee clicks "Update" in the quarterly Check-In modal; Axios POSTs `actualAchievement` and `completionDate` to `/api/check-ins` with a Bearer JWT.
2. **Express Gateway** — `server.ts` (dev) or `api/index.ts` (Vercel) receives the request; CORS and `express.json()` parse it.
3. **authenticate middleware** — Extracts the JWT from the `Authorization` header, verifies it against `JWT_SECRET`, and loads the full `User` document onto `req.user` (excluding `passwordHash`).
4. **phaseGate middleware** — Queries the open `Cycle`; if the current cycle phase is not in the `allowedPhases` list (e.g., `['Q1','Q2','Q3','Q4']`), returns `403 Forbidden`.
5. **checkInController.upsertCheckIn** — Calls `CheckIn.findOne({ goalId, quarter })`; if found, updates in place; otherwise creates a new record.
6. **Mongoose `pre('save')` hook (CheckIn.js:19-33)** — Loads the associated `Goal`, reads its `uomType`/`target`/`deadline`, and calls `computeScore(uomType, target, achievement, deadline, completionDate)` from `uomScore.js`. The returned score is stored in `progressScore`.
7. **Mongoose `post('save')` hook (CheckIn.js:36-64)** — If the goal is shared and the actor is the primary owner, the hook upserts an identical CheckIn for every employee copy of that shared goal via `findOneAndUpdate({ upsert: true })`.
8. **Response** — The saved CheckIn (with computed `progressScore`) is returned as JSON; the frontend displays it as a percentage.

---

## Installation & Setup

### Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x+ | LTS recommended; ES modules required |
| npm | 10.x+ | Comes with Node 18 |
| MongoDB | 5.0+ | Local instance or MongoDB Atlas cluster |
| Git | Any recent | For cloning the repository |

### Install & Configure

```bash
# 1. Clone the repository
git clone <repository-url> GoalQuest
cd GoalQuest

# 2. Install dependencies (root package includes both frontend and backend)
npm install

# 3. Create .env from .env.example
cp .env.example .env

# 4. Edit .env with your MongoDB URI and JWT secret
#    (the .env.example contains a shared Atlas URI and a placeholder JWT secret)
```

**`# .env` template** (from `.env.example`):

```env
# Required: Gemini API key (for future AI features)
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# Required: App URL (used for self-referential links)
APP_URL="http://localhost:3000"

# Required: MongoDB connection string
# Local:  mongodb://localhost:27017/atomquest
# Atlas:  mongodb+srv://user:pass@cluster0.ysxzhne.mongodb.net/goalquest?retryWrites=true
MONGODB_URI=mongodb://localhost:27017/goalquest

# Required: JWT secret — generate with: openssl rand -hex 32
JWT_SECRET=4508d6748eca435d6f567cfab71333e301c1500763ebf4807feea00f1b04e6400fc6a52f83e1a7802806137ff2f35253bdd80bf05568db34591098fc338cca28

# Optional: Server port (defaults to 3000)
PORT=3000

# Optional: Set to "production" for static file serving
NODE_ENV=development
```

### Database Setup

The database is **auto-seeded** on startup when empty. `backend/config/db.js` calls `runSeed()` after connecting, which creates:

| User | Email | Password | Role |
|---|---|---|---|
| System Admin | `admin@goalquest.com` | `password123` | admin |
| Manager One | `m1@goalquest.com` | `password123` | manager |
| Manager Two | `m2@goalquest.com` | `password123` | manager |
| Employee 1–4 | `emp1@goalquest.com` … | `password123` | employee |

One open Cycle (2024, phase `GOAL_SETTING`) is created; each employee gets a GoalSheet with two goals (50% each).

To run the seed manually:

```bash
npx tsx backend/seed.js
```

### Running the Application

```bash
# Development (Vite HMR + Express API on the same port)
npm run dev

# Type-check without emitting (lint equivalent)
npm run lint

# Build for production (Vite bundles frontend → dist/, esbuild bundles server)
npm run build

# Start the production server
npm start

# Clean build artifacts
npm run clean
```

### Service URLs

| Environment | URL | Description |
|---|---|---|
| Dev API | `http://localhost:3000/api/*` | Express API + Vite middleware |
| Dev Frontend | `http://localhost:3000/` | React SPA served through Vite |
| Production | `http://localhost:3000/` | Express serves static `dist/` |

---

## Usage

### 1. Log In

Navigate to `http://localhost:3000/login`. Use any seed credential, e.g. `admin@goalquest.com` / `password123`. The JWT is stored in `localStorage` alongside the user object via Redux Toolkit.

**Expected outcome:** You are redirected to the Admin dashboard, Manager dashboard, or Employee dashboard based on your role.

### 2. (Admin) Create or Activate a Cycle

From the Admin dashboard → **Cycle Management** tab, click "Start New Cycle". Enter a year (e.g., `2025`) and a date range. The system automatically closes the previous open cycle.

**Expected outcome:** A new `Cycle` document is created with `phase: "GOAL_SETTING"` and `status: "OPEN"`. All goal-creation actions are now permitted.

### 3. (Employee) Create Goals

Navigate to the Employee dashboard (`/employee`). Click **Add Goal**. Fill in the Thrust Area, Title, UoM Type (`MAX`/`MIN`/`TIMELINE`/`ZERO`), Target value, and Weightage (minimum 10%). Repeat up to 8 goals; the total weightage must equal 100%.

**Expected outcome:** Goals are saved to MongoDB under the employee's GoalSheet. The progress bar shows remaining weightage.

### 4. (Employee) Submit Goal Sheet

Once total weightage reaches 100%, click **Submit for Approval**. The sheet transitions from `DRAFT` → `SUBMITTED`.

**Expected outcome:** The sheet appears in the manager's "Cycle Approvals" queue with a `SUBMITTED` badge.

### 5. (Manager) Approve or Return Goal Sheets

Navigate to the Manager dashboard (`/manager`) → **Cycle Approvals** tab. Click "View Details" on a submitted sheet, edit goal targets/weightage inline, then click **Approve Sheet** or **Return** (with a mandatory comment).

**Expected outcome:** The sheet status becomes `APPROVED` (and implicitly `LOCKED`). If returned, the employee's sheet goes back to `DRAFT` with the comment visible.

### 6. (Employee) Quarterly Check-In

After approval, switch to the **Monthly Check-Ins** tab. Select a quarter (`Q1`, `Q2`, etc.). For each goal, click **Update** and enter your actual achievement value, status, and (if TIMELINE) a completion date. The system auto-computes a `progressScore` (0–1).

**Expected outcome:** The check-in is saved with a computed progress percentage displayed (e.g., `80.00%`). If the goal is shared and you are the primary owner, the same check-in is automatically pushed to all recipient employees via a Mongoose hook.

### 7. (Admin/Manager) Export Reports

From the Admin dashboard → **Completion & Stats** tab, click **Export** to download an Excel workbook (`achievement_report.xlsx`) with per-employee, per-quarter achievement data. Managers can view their team's stats via **Stats** endpoints.

**Expected outcome:** A formatted `.xlsx` file is downloaded to your default downloads folder.

---

## Screenshots

> **Tip:** Drop image files into a `screenshots/` directory at the project root. Update the `src` attributes below to match your filenames. Screenshots included in the `docs/` directory are referenced below for convenience.

| File | Description |
|---|---|
| `screenshots/login.png` | Login page with demo credentials |
| `screenshots/employee-dashboard.png` | Employee goal list and quarterly check-in tabs |
| `screenshots/manager-dashboard.png` | Manager approval queue with inline editing |
| `screenshots/admin-dashboard.png` | Admin cycle management, audit logs, and stats |

```html
<!-- Login Page -->
<img src="docs/GoalQuest - Employee Flow.png" alt="Employee Workflow Flowchart" width="800" />

<!-- System Architecture -->
<img src="docs/System Architecture/High-Level System Architecture.png" alt="High-Level System Architecture" width="800" />
<img src="docs/System Architecture/Database Entity Relationship (ER) Diagram.png" alt="Database ER Diagram" width="800" />
<img src="docs/System Architecture/Core Business Logic Flow (Goal Creation & Approval).png" alt="Core Business Logic Flow" width="800" />
```

---

## API Documentation

All endpoints are mounted under `/api/` and require a `Bearer` JWT token in the `Authorization` header unless noted otherwise.

### Auth

#### `POST /api/auth/register`

**Auth:** None (public)

Register a new user account.

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | yes | Min 1 char |
| `email` | string | yes | Must be unique, lowercase |
| `password` | string | yes | Min 6 chars |
| `role` | string | no | enum: `employee`, `manager`, `admin` (default: `employee`) |
| `managerId` | string | no | Valid ObjectId of an existing User |
| `department` | string | yes | Must be one of: `Engineering`, `Sales`, `Quality`, `Human Resources`, `Finance` |

```json
// Request
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "securePass123",
  "role": "employee",
  "department": "Engineering",
  "managerId": "664a2b8f1e8d4c001234a567"
}

// Response — 201 Created
{
  "_id": "664a2c0f1e8d4c001234a568",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "employee",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### `POST /api/auth/login`

**Auth:** None (public)

Authenticate and receive a JWT token.

**Request body:**

| Parameter | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

```json
// Request
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@goalquest.com",
  "password": "password123"
}

// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a567",
  "name": "System Admin",
  "email": "admin@goalquest.com",
  "role": "admin",
  "department": "HR",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Goal Sheets

#### `GET /api/goal-sheets/my`

**Auth:** authenticated user

Fetch or create the authenticated user's GoalSheet for the current open cycle.

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56b",
  "employeeId": "664a2b8f1e8d4c001234a568",
  "cycleId": "664a2b8f1e8d4c001234a569",
  "status": "DRAFT",
  "submittedAt": null,
  "approvedAt": null,
  "approvedBy": null,
  "returnedAt": null,
  "returnComment": ""
}
```

#### `GET /api/goal-sheets/team`

**Auth:** `manager` or `admin`

List all GoalSheets belonging to the manager's direct reports in the open cycle.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a56b",
    "employeeId": {
      "_id": "664a2b8f1e8d4c001234a568",
      "name": "Employee 1",
      "email": "emp1@goalquest.com",
      "department": "Engineering",
      "managerId": "664a2b8f1e8d4c001234a567"
    },
    "cycleId": "664a2b8f1e8d4c001234a569",
    "status": "SUBMITTED",
    "submittedAt": "2024-05-15T10:30:00.000Z"
  }
]
```

#### `POST /api/goal-sheets/:id/submit`

**Auth:** authenticated user

Transition the sheet from `DRAFT` → `SUBMITTED`. Requires total weightage to equal 100% (enforced by `validateWeightage` middleware).

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56b",
  "status": "SUBMITTED",
  "submittedAt": "2024-05-15T10:30:00.000Z"
}
```

#### `POST /api/goal-sheets/:id/approve`

**Auth:** `manager` or `admin`

Transition the sheet to `APPROVED` and record `approvedAt` / `approvedBy`. Creates an audit log entry.

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56b",
  "status": "APPROVED",
  "approvedAt": "2024-05-16T09:00:00.000Z",
  "approvedBy": "664a2b8f1e8d4c001234a567"
}
```

#### `POST /api/goal-sheets/:id/return`

**Auth:** `manager` or `admin`

Transition the sheet back to `DRAFT` with an optional return comment.

**Request body:**

| Parameter | Type | Required |
|---|---|---|
| `comment` | string | no |

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56b",
  "status": "DRAFT",
  "returnedAt": "2024-05-16T09:00:00.000Z",
  "returnComment": "Please adjust weightage allocation."
}
```

---

### Goals

#### `GET /api/goals/sheet/:sheetId`

**Auth:** authenticated user

Retrieve all goals belonging to a specific GoalSheet.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a56c",
    "goalSheetId": "664a2b8f1e8d4c001234a56b",
    "employeeId": "664a2b8f1e8d4c001234a568",
    "cycleId": "664a2b8f1e8d4c001234a569",
    "thrustArea": "Business Growth",
    "title": "Increase Engineering Efficiency",
    "description": "Automate CI/CD pipeline",
    "uomType": "MAX",
    "target": 100,
    "deadline": "2025-04-30T00:00:00.000Z",
    "weightage": 50,
    "status": "NOT_STARTED",
    "isShared": false,
    "createdAt": "2024-05-10T12:00:00.000Z"
  }
]
```

#### `POST /api/goals`

**Auth:** authenticated user
**Phase Gate:** `GOAL_SETTING`

Create a new goal under a GoalSheet. Only allowed when the sheet is in `DRAFT` status and the cycle phase is `GOAL_SETTING`.

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `goalSheetId` | string | yes | Valid ObjectId; sheet must be `DRAFT` |
| `thrustArea` | string | yes | e.g. Quality, Cost, Safety, Productivity, Business Growth |
| `title` | string | yes | |
| `description` | string | no | |
| `uomType` | string | yes | enum: `MIN`, `MAX`, `TIMELINE`, `ZERO` |
| `target` | number | yes | Auto-set to `0` if `uomType === 'ZERO'` |
| `deadline` | string (ISO) | no | Required if `uomType === 'TIMELINE'` |
| `weightage` | number | yes | Min 10, projected total ≤ 100 |

```json
// Request
POST /api/goals
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "goalSheetId": "664a2b8f1e8d4c001234a56b",
  "thrustArea": "Safety",
  "title": "Maintain Zero Safety Incidents",
  "uomType": "ZERO",
  "target": 0,
  "weightage": 50
}

// Response — 201 Created
{
  "_id": "664a2b8f1e8d4c001234a56d",
  "goalSheetId": "664a2b8f1e8d4c001234a56b",
  "employeeId": "664a2b8f1e8d4c001234a568",
  "cycleId": "664a2b8f1e8d4c001234a569",
  "thrustArea": "Safety",
  "title": "Maintain Zero Safety Incidents",
  "uomType": "ZERO",
  "target": 0,
  "weightage": 50,
  "status": "NOT_STARTED",
  "isShared": false
}
```

#### `PATCH /api/goals/:id`

**Auth:** authenticated user

Update an existing goal. If the GoalSheet is `APPROVED`/`LOCKED`, only `admin` can modify (others get `403`). For shared goals, `title`/`target`/`deadline`/`uomType`/`description` are read-only for non-owners.

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `title` | string | no | Read-only on shared goals (non-owner) |
| `target` | number | no | Auto-set to `0` if `uomType === 'ZERO'` |
| `weightage` | number | no | Min 10 |
| `status` | string | no | enum: `NOT_STARTED`, `ON_TRACK`, `COMPLETED` |

```json
// Request
PATCH /api/goals/664a2b8f1e8d4c001234a56d
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "status": "ON_TRACK"
}

// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56d",
  "title": "Maintain Zero Safety Incidents",
  "status": "ON_TRACK",
  "weightage": 50
}
```

#### `DELETE /api/goals/:id`

**Auth:** authenticated user
**Phase Gate:** `GOAL_SETTING`

Delete a goal. If the sheet is not `DRAFT`, only `admin` can delete. Deleted goals from locked sheets are audit-logged.

```json
// Response — 200 OK
{
  "message": "Goal removed"
}
```

#### `POST /api/goals/push`

**Auth:** `manager` or `admin`

Push a shared goal to multiple employees. Creates a primary goal owned by the manager and copies to each recipient's GoalSheet. Recipients whose sheets would exceed 100% total weightage are silently skipped (logged as a warning). Shared goals default to 10% weightage.

**Request body:**

| Parameter | Type | Required |
|---|---|---|
| `recipients` | string[] | yes | Array of employee ObjectIds |
| `goalData` | object | yes | Goal fields: `title`, `description`, `uomType`, `target`, `weightage`, `deadline` |

```json
// Request
POST /api/goals/push
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "recipients": ["664a2b8f1e8d4c001234a568", "664a2b8f1e8d4c001234a569"],
  "goalData": {
    "title": "Increase System Uptime",
    "description": "Maintain 99.9% uptime SLA",
    "uomType": "MAX",
    "target": 99.9,
    "weightage": 10,
    "deadline": "2025-04-30T00:00:00.000Z"
  }
}

// Response — 201 Created
{
  "message": "Shared goal pushed successfully"
}
```

---

### Check-Ins

#### `GET /api/check-ins/goal/:goalId`

**Auth:** authenticated user

Retrieve all quarterly check-ins for a specific goal.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a56e",
    "goalId": "664a2b8f1e8d4c001234a56d",
    "employeeId": "664a2b8f1e8d4c001234a568",
    "cycleId": "664a2b8f1e8d4c001234a569",
    "quarter": "Q1",
    "actualAchievement": 85,
    "completionDate": null,
    "status": "ON_TRACK",
    "progressScore": 0.85,
    "managerComment": "Well done",
    "managerCommentAt": "2024-05-16T09:00:00.000Z"
  }
]
```

#### `GET /api/check-ins/team`

**Auth:** `manager` or `admin`

List all check-ins for direct reports in the open cycle.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a56e",
    "goalId": {
      "_id": "664a2b8f1e8d4c001234a56d",
      "title": "Maintain Zero Safety Incidents",
      "uomType": "ZERO",
      "target": 0,
      "weightage": 50,
      "employeeId": {
        "_id": "664a2b8f1e8d4c001234a568",
        "name": "Employee 1",
        "department": "Engineering",
        "managerId": "664a2b8f1e8d4c001234a567"
      }
    },
    "quarter": "Q1",
    "actualAchievement": 0,
    "progressScore": 1,
    "status": "COMPLETED"
  }
]
```

#### `POST /api/check-ins`

**Auth:** authenticated user
**Phase Gate:** `['Q1', 'Q2', 'Q3', 'Q4']`

Upsert a quarterly check-in for a goal. The quarter must match the current cycle phase (enforced by `checkInController` — returns `403` if mismatched).

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `goalId` | string | yes | Valid ObjectId |
| `quarter` | string | yes | enum: `Q1`, `Q2`, `Q3`, `Q4`; must match cycle phase |
| `actualAchievement` | number | no | Required if `uomType != TIMELINE` |
| `completionDate` | string (ISO) | no | Required if `uomType === 'TIMELINE'` |
| `status` | string | yes | enum: `NOT_STARTED`, `ON_TRACK`, `COMPLETED` |

```json
// Request
POST /api/check-ins
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "goalId": "664a2b8f1e8d4c001234a56d",
  "quarter": "Q1",
  "actualAchievement": 0,
  "status": "COMPLETED"
}

// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56e",
  "goalId": "664a2b8f1e8d4c001234a56d",
  "employeeId": "664a2b8f1e8d4c001234a568",
  "cycleId": "664a2b8f1e8d4c001234a569",
  "quarter": "Q1",
  "actualAchievement": 0,
  "completionDate": null,
  "status": "COMPLETED",
  "progressScore": 1
}
```

#### `POST /api/check-ins/:id/comment`

**Auth:** `manager` or `admin`

Add a manager comment to a check-in record.

**Request body:**

| Parameter | Type | Required |
|---|---|---|
| `comment` | string | yes |

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56e",
  "managerComment": "Great progress this quarter",
  "managerCommentAt": "2024-05-16T10:00:00.000Z"
}
```

---

### Admin

#### `GET /api/admin/cycles`

**Auth:** `admin`

List all cycles, sorted by year descending.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a569",
    "year": 2024,
    "phase": "GOAL_SETTING",
    "openDate": "2024-05-01T00:00:00.000Z",
    "closeDate": "2025-04-30T00:00:00.000Z",
    "status": "OPEN",
    "createdBy": "664a2b8f1e8d4c001234a567"
  }
]
```

#### `POST /api/admin/cycles`

**Auth:** `admin`

Create a new cycle. Closes any existing open cycle first.

**Request body:**

| Parameter | Type | Required |
|---|---|---|
| `year` | number | yes |
| `openDate` | string (ISO) | yes |
| `closeDate` | string (ISO) | yes |

```json
// Request
POST /api/admin/cycles
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "year": 2025,
  "openDate": "2025-01-01T00:00:00.000Z",
  "closeDate": "2025-12-31T00:00:00.000Z"
}

// Response — 201 Created
{
  "_id": "664a2b8f1e8d4c001234a570",
  "year": 2025,
  "phase": "GOAL_SETTING",
  "status": "OPEN",
  "openDate": "2025-01-01T00:00:00.000Z",
  "closeDate": "2025-12-31T00:00:00.000Z"
}
```

#### `PATCH /api/admin/cycles/:id/phase`

**Auth:** `admin`

Transition an open cycle to a new phase.

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `phase` | string | yes | enum: `GOAL_SETTING`, `Q1`, `Q2`, `Q3`, `Q4` |

```json
// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a570",
  "year": 2025,
  "phase": "Q2",
  "status": "OPEN"
}
```

#### `GET /api/admin/audit-logs`

**Auth:** `admin`

Returns the 100 most recent audit log entries, newest first.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a571",
    "entityType": "goalSheet",
    "entityId": "664a2b8f1e8d4c001234a56b",
    "actor": {
      "_id": "664a2b8f1e8d4c001234a567",
      "name": "System Admin",
      "email": "admin@goalquest.com"
    },
    "action": "APPROVE",
    "fieldChanged": "status",
    "oldValue": "SUBMITTED",
    "newValue": "APPROVED",
    "timestamp": "2024-05-16T09:00:00.000Z"
  }
]
```

#### `GET /api/admin/stats`

**Auth:** `admin`

Returns organization-wide completion statistics and departmental breakdown rates.

```json
// Response — 200 OK
{
  "totalEmployees": 4,
  "totalGoals": 8,
  "approved": 2,
  "breakdown": [
    { "dept": "Engineering", "rate": 50 },
    { "dept": "Sales", "rate": 0 },
    { "dept": "Quality", "rate": 0 },
    { "dept": "Human Resources", "rate": 0 },
    { "dept": "Finance", "rate": 0 }
  ]
}
```

#### `GET /api/admin/users`

**Auth:** `admin`

List all users with name, email, department, and role.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a567",
    "name": "System Admin",
    "email": "admin@goalquest.com",
    "department": "HR",
    "role": "admin"
  }
]
```

#### `GET /api/admin/goal-sheets`

**Auth:** `admin`

List all goal sheets with populated employee data.

```json
// Response — 200 OK
[
  {
    "_id": "664a2b8f1e8d4c001234a56b",
    "employeeId": {
      "_id": "664a2b8f1e8d4c001234a568",
      "name": "Employee 1",
      "email": "emp1@goalquest.com",
      "department": "Engineering"
    },
    "cycleId": "664a2b8f1e8d4c001234a569",
    "status": "APPROVED",
    "approvedAt": "2024-05-16T09:00:00.000Z"
  }
]
```

#### `PATCH /api/admin/goal-sheets/:id/status`

**Auth:** `admin`

Force-change a goal sheet's status (e.g., unlock `APPROVED` → `DRAFT`, or re-lock `DRAFT` → `APPROVED`).

**Request body:**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `status` | string | yes | enum: `DRAFT`, `SUBMITTED`, `APPROVED`, `LOCKED` |

```json
// Request
PATCH /api/admin/goal-sheets/664a2b8f1e8d4c001234a56b
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "status": "DRAFT"
}

// Response — 200 OK
{
  "_id": "664a2b8f1e8d4c001234a56b",
  "status": "DRAFT"
}
```

---

### Reports

#### `GET /api/reports/export`

**Auth:** `admin` or `manager`

Exports an Excel workbook (`achievement_report.xlsx`) containing all goals, check-ins, and computed scores for the open cycle.

```bash
# Response — 200 OK, Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
# Content-Disposition: attachment; filename=achievement_report.xlsx
```

Workbook columns: Employee Name, Department, Goal Title, UoM, Target, Weightage, Q1 Actual, Q2 Actual, Q3 Actual, Q4 Actual, Final Score.

#### `GET /api/reports/stats/system`

**Auth:** `admin`

Returns the same statistics as `GET /api/admin/stats`.

```json
// Response — 200 OK
{
  "totalEmployees": 4,
  "totalGoals": 8,
  "approved": 2,
  "breakdown": [...]
}
```

#### `GET /api/reports/stats/manager`

**Auth:** `manager` or `admin`

Returns manager-specific statistics: direct report count, pending approvals, and total check-ins.

```json
// Response — 200 OK
{
  "directReports": 2,
  "pendingApprovals": 1,
  "unreadCheckIns": 3
}
```

---

## Engineering Decisions

### Decision 1: MongoDB (Mongoose) vs PostgreSQL

| Criterion | MongoDB (Chosen) | PostgreSQL (Considered) |
|---|---|---|
| Schema flexibility | Goals with varying UoM types, optional deadlines — stored as documents without rigid columns | Requires NULL columns or JSON fields for varying goal attributes |
| Native references | `ObjectId` refs for Employee → Manager hierarchy; Mongoose `populate()` resolves nested lookups | JOINs required for team + cycle + goal traversal |
| Hook-based scoring | `pre('save')` / `post('save')` hooks on CheckIn auto-compute scores and sync shared goals | Would require trigger functions or application-level logic |
| Atlas hosting | Existing Atlas cluster with demo data seeded on connect | Would require new Postgres provisioning |
| Query complexity | Simple by-design: lookups by `_id`, `employeeId`, `cycleId`, `goalSheetId` | Overkill for this access pattern |

**Rationale:** The data model is inherently document-oriented — goals contain optional fields based on UoM type, cycles have phases, and employee hierarchies use parent references. Mongoose hooks provide an elegant way to auto-score check-ins and sync shared goals without controller bloat.

### Decision 2: JWT vs Session Cookies

| Criterion | JWT (Chosen) | Session Cookies (Considered) |
|---|---|---|
| Statelessness | No server-side session store; token carries all claims | Requires Redis/Memcached for session store |
| Horizontal scaling | Trivially scales across Vercel serverless functions | Requires sticky sessions or external session store |
| Frontend persistence | `localStorage` stores token; Axios interceptor re-attaches on each request | Automatic cookie handling, but CSRF tokens needed |
| Expiration | 30-day token TTL; simple client-side expiry check | Server-side invalidation possible but adds complexity |
| CORS | Stateless tokens work cleanly with `cors()` middleware | Cookies require `credentials: true` and origin whitelisting |

**Rationale:** The application targets Vercel serverless deployment where stateful sessions are costly. JWT enables stateless authentication across serverless invocations.

### Decision 3: Vite + Express Combined vs Separate Services

| Criterion | Vite Middleware on Express (Chosen) | Separate Vite + Express (Considered) |
|---|---|---|
| Single port | Both API and UI on `localhost:3000` — no CORS issues in dev | Proxy config needed for API calls in Vite config |
| Hot reload | Vite HMR works through Express middleware | Two dev servers; Vite proxies `/api` to Express |
| Build output | `npm run build` produces `dist/` served by Express in prod | Two separate build artifacts to deploy |
| Simplicity | One process, one port, one `npm run dev` command | Two `package.json` scripts, two processes |
| SSR potential | Vite middleware mode is SPA-compatible | Would need separate SSR setup |

**Rationale:** For a single-developer, hackathon-scale project, combining the Vite dev server with Express eliminates proxy configuration, CORS headaches, and simplifies deployment to a single Node.js process.

### Decision 4: Mongoose Hooks vs Controller Logic for Scoring

| Criterion | `pre('save')` / `post('save')` Hooks (Chosen) | Controller-Level Scoring (Considered) |
|---|---|---|
| DRY | Score computation happens automatically on every save path | Must be called in every controller method that writes a CheckIn |
| Discoverability | Obscured in model file; new devs must read CheckIn.js | Visible at call site in controllers |
| Test isolation | Harder to unit-test in isolation | Easy to mock and test |
| Sync shared goals | Automatically propagates to all recipients | Would need manual loop in controller |

**Rationale:** The project uses a "thin controller, fat model" philosophy. The `post('save')` hook on CheckIn handles shared-goal synchronization — a concern that would require duplicating ~25 lines of code in every endpoint that writes check-ins.

### Decision 5: Express Async-Errors vs Try/Catch in Every Route

| Criterion | `express-async-errors` (Chosen) | Manual try/catch (Alternative) |
|---|---|---|
| Boilerplate | `import 'express-async-errors'` once; all async errors auto-forward to error handler | Every controller wraps in `try { ... } catch (err) { ... }` |
| Error consistency | Single error handler in `server.ts`/`api/index.ts` | Error responses scattered per-controller |
| Catch rate | 100% — catches unhandled promise rejections automatically | Relies on developer discipline; easy to forget |
| Debugging | Stack traces preserved with `NODE_ENV !== 'production'` | Same, but requires manual rethrow |

**Rationale:** `express-async-errors` is a battle-tested, zero-dependency patch that eliminates an entire category of forgotten error handling. The project has 6 controllers across 30+ endpoints — manual try/catch would add 200+ lines of boilerplate.

### Decision 6: Phase Gate as Middleware vs Per-Controller Checks

| Criterion | `phaseGate` Middleware (Chosen) | Inline Checks (Alternative) |
|---|---|---|
| Reusability | `phaseGate(['Q1','Q2','Q3','Q4'])` applied to any route | Phase check duplicated in `createGoal`, `upsertCheckIn` |
| Consistency | Centralized phase definitions in `Cycle` model | Phase names could drift across controllers |
| Blocking | 403 returned before controller runs — no DB write attempted | Controller might perform partial writes before checking phase |
| Testability | Middleware can be unit-tested independently | Phase logic buried inside controller tests |

**Rationale:** Phase gating is a cross-cutting concern that applies to multiple routes. Middleware ensures it cannot be bypassed by a new controller that forgets the check.

### Decision 7: esbuild vs tsc for Server Production Build

| Criterion | esbuild (Chosen) | tsc (Alternative) |
|---|---|---|
| Bundle speed | <1s bundling of `server.ts` | ~5-10s for type-checking + emit |
| Output format | CommonJS (`--format=cjs`) for Node.js compatibility | Can output ESM or CJS |
| Dependency exclusion | `--packages=external` keeps node_modules out of bundle | `tsc` bundles everything unless `externals` configured |
| Source maps | Built-in `--sourcemap` | Built-in but slower |
| Type safety | No type-checking during build (dev uses `tsc --noEmit`) | Type-checks and emits in same pass |

**Rationale:** esbuild is 10–100x faster than tsc for bundling server code. Type safety is validated separately via `npm run lint` (which runs `tsc --noEmit`).

### Decision 8: Weightage Validation in Middleware vs Frontend + Model

| Criterion | `validateWeightage` Middleware (Chosen) | Frontend-only or Model-only (Alternative) |
|---|---|---|
| Security | Server rejects >100% even if frontend is bypassed | Frontend can be disabled; model hooks add complexity |
| Granularity | Different rules for POST (`/submit` vs create) | One-size-fits-all |
| Feedback | Detailed error: "Total weightage: 105%, exceeds 100%" | Generic "validation failed" |
| PATCH support | Handles partial updates by fetching current weight | Would need full re-validation on every patch |

**Rationale:** Business rules (10% minimum, 100% total) must be enforced server-side. The middleware approach allows route-specific rules (submit requires exactly 100%) and partial-update awareness for PATCH requests.

### Decision 9: Antd + Tailwind vs Styled-Components or Chakra

| Criterion | Antd + Tailwind (Chosen) | Styled-Components / Chakra (Considered) |
|---|---|---|
| Bundle size | Antd 6 is tree-shakable; Tailwind purges unused CSS | Chakra adds component + emotion overhead |
| Design tokens | Antd provides built-in theme tokens (blue-600, borderRadius) | Custom theme objects required |
| Speed of dev | Pre-built Table, Modal, Form components with validation | Must build forms, modals, tables from scratch |
| RBAC visibility | `RoleBadge` component conditionally renders role colors | Would need custom color mapping |
| Responsiveness | Antd Grid + Tailwind breakpoint classes | Requires manual media queries |

**Rationale:** Antd's enterprise-grade components (Table with expandable rows, Form with field-level validation, Modal with destroy lifecycle) accelerate development of a complex data-entry app. Tailwind handles the responsive layout and role-based color theming.

### Decision 10: Vercel vs Docker/Kubernetes for Deployment

| Criterion | Vercel Serverless (Chosen) | Docker + K8s (Alternative) |
|---|---|---|
| Zero config deploy | `vercel.json` rewrite rules map `/api/*` to `api/index.ts` | Dockerfile + `docker-compose up` required |
| Cold start | ~500ms for serverless function spin-up | Container already warm |
| Scaling | Automatic; Vercel handles concurrency | Manual HPA configuration |
| Cost | Free tier covers low traffic | Always-on container costs |
| Complexity | One `vercel --prod` command | `docker build && docker push && kubectl apply` |

**Rationale:** The project is a demo/hackathon deliverable. Vercel's `vercel.json` rewrites handle both the SPA fallback and API routing with zero configuration. A Dockerfile is not yet present; deployment is via Vercel's platform.

---

## Testing

### Current Testing Coverage

| Layer | Test Framework | Status |
|---|---|---|
| Unit (uomScore.js) | None | Not implemented |
| Unit (controllers) | None | Not implemented |
| Integration (API endpoints) | None | Not implemented |
| E2E (frontend flows) | None | Not implemented |
| Linting | `tsc --noEmit` | Available via `npm run lint` |

**No automated test suite exists.** The project relies on manual verification and seed-data testing.

### Linting

```bash
# Type-check all TypeScript (serves as the primary lint step)
npm run lint

# Expected output (success):
# (no output — exits 0)
#
# Expected output (failure, e.g. type error):
# server.ts:10:8 - error TS2307: Cannot find module './server/routes/auth.js' or its corresponding type declarations.
```

### Manual Verification Checklist

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| 1 | Login with seed credentials | POST `/api/auth/login` with `admin@goalquest.com` / `password123` | Returns JWT + user object |
| 2 | Phase-gated goal creation | Set cycle phase to `Q2`, POST `/api/goals` | Returns 403 with phase mismatch message |
| 3 | Weightage enforcement | Create goals totaling 90% weight, POST `/api/goal-sheets/:id/submit` | Returns 400, "Total weightage ... must equal 100%" |
| 4 | Shared goal weight skip | Push shared goal to employee whose sheet already has 95% weight | Goal skipped; no error thrown |
| 5 | UoM ZERO target override | POST `/api/goals` with `uomType: "ZERO"`, `target: 50` | Saved `target` is `0` |
| 6 | Audit logging | Admin modifies goal on `APPROVED` sheet | AuditLog entry created with `UPDATE_LOCKED` action |

### Coverage Gaps

| Component / File | Gap | Risk |
|---|---|---|
| `uomScore.js` | No unit tests for scoring logic | Incorrect progress scores on all check-ins |
| `goalController.js` | No integration tests for `pushSharedGoal` | Silent skips may hide data loss |
| `goalSheetController.js` | No tests for approve/return lifecycle | Sheet status transitions may corrupt state |
| `validateWeightage.js` | No tests for PATCH partial-update logic | Weightage totals may diverge after partial edits |
| `authController.js` | No tests for login/register edge cases | Auth bypass or credential leaks undetected |
| `checkInController.js` | No tests for quarter-spoofing fix | Users may update wrong-quarter check-ins |
| `frontend/App.jsx` | No component tests for role routing | Wrong role may reach unauthorized dashboard |
| `frontend/components/GoalForm.jsx` | No tests for weightage Progress bar | UI may display incorrect remaining weight |
| Error handler | Global error handler returns full stack in dev | Stack traces may leak in non-prod deployments |
| `seed.js` | No test for idempotency | Re-running seed may create duplicate data |

### Recommended Test Stack (Future)

| Need | Recommended Tool |
|---|---|
| Backend unit/integration | Jest + `mongodb-memory-server` |
| Frontend unit tests | Vitest + React Testing Library |
| E2E flows | Playwright |
| API contract testing | Pact or OpenAPI schema validation |

---

## Limitations & Future Improvements

### Current Limitations

| # | Limitation | Affected Files | Severity |
|---|---|---|---|
| 1 | No automated test suite | Entire codebase | High |
| 2 | `pushSharedGoal` uses synchronous `for...of` loop — no batch/queue for large teams | `backend/controllers/goalController.js:116-152` | Medium |
| 3 | Skipped employees in shared goal push are not returned in the HTTP response | `goalController.js` | Medium |
| 4 | `@google/genai` installed but no AI features implemented | `package.json` | Low |
| 5 | `d3`, `recharts`, `motion` installed but unused, adding bundle weight | `package.json` | Medium |
| 6 | No Dockerfile or docker-compose for containerized deployment | Project root | Medium |
| 7 | Frontend package.json versions are stale (React 18, antd 5) while root uses React 19, antd 6 — potential conflicts | `frontend/package.json` | Medium |
| 8 | `validateWeightage` only checks `>= 10%` — fractional weightages (e.g., 10.5) are allowed and may cause rounding issues in reports | `backend/middleware/validateWeightage.js:20` | Low |
| 9 | No rate limiting on auth endpoints — brute-force attacks possible | `backend/routes/auth.js` | High |
| 10 | CheckIn `pre('save')` hook can return `0` if the Goal lookup fails silently — no error propagation | `backend/models/CheckIn.js:19-33` | Medium |
| 11 | Admin `/goal-sheets/:id/status` endpoint has no audit logging — status changes are untraceable | `backend/routes/admin.js:31-35` | Medium |
| 12 | No pagination on `GET /api/admin/audit-logs` (100-item hard cap) | `backend/controllers/adminController.js:39-44` | Low |

### Future Roadmap

1. **Implement automated test suite** — Add Jest for backend unit/integration tests with `mongodb-memory-server`; add Vitest + RTL for frontend; add Playwright for E2E coverage targeting all role flows.

2. **Add Redis-based rate limiting** — Protect `/api/auth/login` and `/api/auth/register` with `express-rate-limit` to prevent credential-stuffing and brute-force attacks.

3. **Implement AI-powered goal suggestions** — Wire up the installed `@google/genai` SDK to `backend/utils/aiService.js` to suggest UoM type, target values, and weightage distributions based on departmental historical data.

4. **Remove unused dependencies** — Prune `d3`, `recharts`, `motion`, `@google/genai` (until implemented), and the stale `frontend/package.json` to reduce bundle size and security surface.

5. **Add Dockerfile and docker-compose** — Create a production-ready container with multi-stage build (Vite build → Node static server) and a `docker-compose.yml` for local MongoDB + app orchestration.

6. **Implement real-time notifications** — Add WebSocket support (or Server-Sent Events) so managers see immediate notifications when team members submit or check in.

7. **Migrate to TypeScript throughout backend** — Convert `backend/` from `.js` to `.ts` to match the `server.ts` entry point and eliminate the dual-type boundary.

8. **Add API versioning** — Prefix routes with `/api/v1/` to enable backward-compatible breaking changes.

9. **Implement role-based field-level permissions on shared goals** — Extend the `requireRole` middleware to support field-level ACLs so managers can edit shared goal targets while employees can only view them.

10. **Add data export for all entities** — Beyond the Excel report, provide CSV exports for audit logs, user lists, and check-in histories with column filtering and date-range selection.

11. **Implement tenant isolation** — Add company-level multi-tenancy to support multiple organizations on a single MongoDB cluster, with each tenant having its own cycles and users.

12. **Add calendar-based deadline reminders** — Send automated email or in-app notifications to employees 7 and 3 days before quarterly check-in deadlines.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 GoalQuest Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*Built with ❤️ for the GoalQuest engineering team.*
