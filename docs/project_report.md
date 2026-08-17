**Section 01 — Project Overview**
Project name: GoalQuest Goal Portal [metadata.json, line 2]
Purpose: To build a structured, digital Goal Setting & Tracking Portal that eliminates manual goal-tracking methods and supports the full lifecycle of employee goals.
Current status: Completed
Tech stack summary: React [package.json, line 33], React DOM [package.json, line 34], React Router DOM [package.json, line 36], Tailwind CSS [package.json, line 45], Redux Toolkit [package.json, line 16], React Redux [package.json, line 35], Axios [package.json, line 20], Ant Design [package.json, line 19], Express [package.json, line 27], Mongoose [package.json, line 31], jsonwebtoken [package.json, line 29], bcryptjs [package.json, line 21], dotenv [package.json, line 25], cors [package.json, line 22], exceljs [package.json, line 26], Day.js [package.json, line 24], Lucide React [package.json, line 30], TypeScript [tsconfig.json, line 1].

**Section 02 — Problem Statement**
Organizations relying on manual or fragmented goal-tracking methods (spreadsheets, emails, offline review cycles) struggle with alignment, visibility, and accountability, creating blind spots for managers, confusion for employees, and difficulty for HR teams during appraisal time. The challenge is to build a structured, digital portal that eliminates these pain points and supports the full lifecycle of employee goals — from creation and alignment to quarterly check-ins and performance visibility — while being intuitive, reliable, and audit-ready.

**Section 03 — Tech Stack (Verified Only)**
React | package.json | 33
React DOM | package.json | 34
React Router DOM | package.json | 36
Tailwind CSS | package.json | 45
Redux Toolkit | package.json | 16
React Redux | package.json | 35
Axios | package.json | 20
Ant Design | package.json | 19
Express | package.json | 27
Mongoose | package.json | 31
jsonwebtoken | package.json | 29
bcryptjs | package.json | 21
dotenv | package.json | 25
cors | package.json | 22
exceljs | package.json | 26
Day.js | package.json | 24
Lucide React | package.json | 30
TypeScript | tsconfig.json | 1

**Section 04 — System Architecture**
The system is structured as a full-stack application built around a Node.js/Express API and a React frontend:
- **API Server Layer**: An Express.js backend defined in `server.ts` and `api/index.ts` connecting to a MongoDB database. [server.ts, line 28]
- **Routes Layer**: Modular backend routes separating domains such as `auth`, `goalSheets`, `goals`, `checkIns`, `admin`, and `reports`. [server.ts, line 34-39]
- **Frontend Layer**: A React SPA that is either served statically via Express in production or through Vite middleware in development. [server.ts, line 42-54]
- **Security & Lifecycle Layer**: Custom Express middlewares exist for `authenticate`, `requireRole`, `phaseGate` (restricting actions based on the active organizational cycle), and `validateWeightage` to enforce business constraints. [backend/routes/goals.js, line 10-13]

**Section 05 — Confirmed Metrics and Configuration Values**
JWT Expiration | "30d" | backend/controllers/authController.js | 7
Bcrypt Hash Salt Rounds | 10 | backend/controllers/authController.js | 18
Server Port | 3000 | server.ts | 25
TIMELINE Days Remaining Calculation | Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)) | backend/utils/uomScore.js | 35
Shared Goal Max Weightage Limit | 100 | backend/controllers/goalController.js | 124
Shared Goal New Weight | 10 | backend/controllers/goalController.js | 122

**Section 06 — Engineering Challenges and Solutions**
1. **Zero-Based Target Enforcement**
   - **Problem**: When a goal's Unit of Measure is 'ZERO', the user might incorrectly supply a non-zero numerical target causing inaccurate score calculations.
   - **Solution**: The server overrides any provided target by hardcoding it to 0 before saving: `if (req.body.uomType === 'ZERO') { req.body.target = 0; }`. [backend/controllers/goalController.js, line 16-18]

2. **Modifying Locked Goal Sheets**
   - **Problem**: Approved or locked sheets shouldn't be edited by standard users.
   - **Solution**: Added a check where modifying a goal requires checking `sheet.status === 'APPROVED' || sheet.status === 'LOCKED'` and if the role isn't 'admin', throws a 403 Forbidden. Admin modifications are explicitly logged via `createAuditEntry`. [backend/controllers/goalController.js, line 37-41]

3. **Shared Goal Constraints**
   - **Problem**: When a manager pushes a shared goal to employees, the newly added weightage might cause the employee's total goal weightage to exceed the maximum 100% threshold.
   - **Solution**: The system calculates existing weightage via `currentTotal = existingGoals.reduce(...)` and intelligently skips pushing the shared goal to that specific employee if `currentTotal + newWeight > 100`. [backend/controllers/goalController.js, line 124-127]

**Section 07 — Features List**
- User Registration and Authentication [backend/routes/auth.js, line 7-8]
- Goal Sheets CRUD (Fetch personal/team sheets, Submit, Approve, Return) [backend/routes/goalSheets.js, line 18-22]
- Goals Management (Create, Update, Delete, Push Shared Goal) [backend/routes/goals.js, line 19-23]
- Phase Gate Enforcement for Goal Actions [backend/routes/goals.js, line 20]
- Cycle Management (Create Cycle, Update Phase) [backend/routes/admin.js, line 18-20]
- System Audit Logs Retrieval [backend/routes/admin.js, line 21]
- Report & Statistics Generation [backend/routes/admin.js, line 22]

**Section 08 — Key Learnings**
- Translated a comprehensive Business Requirements Document (BRD) into a functional full-stack application under hackathon time constraints.
- Implemented complex Role-Based Access Control (RBAC) distinguishing between Employee, Manager, and Admin workflows.
- Engineered rigorous backend validation to enforce business rules, such as ensuring goal weightages strictly sum to 100% and handling different Unit of Measurement (UoM) scoring logic.

**Section 09 — Resume Bullet Drafts**
- Developed secure user authentication with jsonwebtoken setting a session expiration of "30d" and hashed passwords using bcryptjs with 10 salt rounds [backend/controllers/authController.js, line 7].
- Engineered a dynamic Unit of Measure scoring module that accurately calculates remaining days on TIMELINE metrics utilizing the algorithm `Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))` [backend/utils/uomScore.js, line 35].
- Designed a scalable shared goal synchronization feature that protects employee workloads by ensuring cumulative metrics never exceed a maximum weightage limit of 100 [backend/controllers/goalController.js, line 124].
- Standardized goal-sheet lifecycle distribution by enforcing that manager-pushed `sharedGoal` additions default to a rigid weightage of 10 [backend/controllers/goalController.js, line 122].

**Flagged Items — Require Manual Verification Before Use in Resume**
- **@google/genai**: INSTALLED BUT UNUSED. Appears in package.json but lacks any imports. Candidate needs to remove it or implement the AI functionality.
- **d3**: INSTALLED BUT UNUSED. Appears in package.json but lacks any imports. Candidate needs to remove it or implement charting.
- **motion**: INSTALLED BUT UNUSED. Appears in package.json but lacks any imports. Candidate needs to remove it or implement animations.
- **recharts**: INSTALLED BUT UNUSED. Appears in package.json but lacks any imports. Candidate needs to remove it or implement charts.
- **i18n / Localization**: Verified as not required based on the Hackathon Problem Statement.
