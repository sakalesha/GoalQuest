# GoalQuest Project Submission

## 1. Working Link
* **Live Deployment:** [INSERT YOUR VERCEL/DEPLOYMENT LINK HERE]

## 2. Source Code Repository
* **GitHub Repository:** [https://github.com/sakalesha/GoalQuest](https://github.com/sakalesha/GoalQuest)

## 3. Architecture Diagrams

### High-Level System Architecture
```mermaid
flowchart TB
    subgraph Client ["Client Side (React / Vite)"]
        UI["React UI Components (Ant Design)"]
        Redux["Redux Toolkit Store"]
        Axios["Axios API Interceptors"]
        
        UI <--> Redux
        Redux <--> Axios
    end

    subgraph Server ["Server Side (Node.js / Express)"]
        Router["Express Router (/api)"]
        AuthMid["Auth & Role Middleware"]
        
        subgraph Controllers ["Controllers"]
            AuthController
            GoalController
            AdminController
            ReportController
        end
        
        Router --> AuthMid
        AuthMid --> Controllers
    end

    subgraph Database ["Database Layer (MongoDB)"]
        Mongoose["Mongoose ODM"]
        MongoDB[(MongoDB Atlas)]
        
        Mongoose <--> MongoDB
    end

    %% Network Connections
    Axios -- "HTTP/REST API Requests" --> Router
    Controllers -- "CRUD Operations" --> Mongoose

    %% Styling
    classDef client fill:#e0f7fa,stroke:#006064,stroke-width:2px;
    classDef server fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    class Client client;
    class Server server;
    class Database db;
```

### Database Entity Relationship (ER) Diagram
```mermaid
erDiagram
    USER ||--o{ GOAL_SHEET : "owns (employee)"
    USER ||--o{ GOAL_SHEET : "approves (manager)"
    USER ||--o{ AUDIT_LOG : "triggers action"
    
    CYCLE ||--o{ GOAL_SHEET : "defines period for"
    
    GOAL_SHEET ||--o{ GOAL : "contains"
    
    GOAL ||--o{ CHECK_IN : "has progress updates"

    USER {
        ObjectId _id PK
        String name
        String email
        String password
        String role "enum: admin, manager, employee"
        ObjectId manager "Ref: User"
    }

    CYCLE {
        ObjectId _id PK
        String name
        Date startDate
        Date endDate
        Boolean isActive
    }

    GOAL_SHEET {
        ObjectId _id PK
        ObjectId employee "Ref: User"
        ObjectId manager "Ref: User"
        ObjectId cycle "Ref: Cycle"
        String status "enum: DRAFT, PENDING_APPROVAL, APPROVED, RETURNED"
    }

    GOAL {
        ObjectId _id PK
        ObjectId goalSheet "Ref: GoalSheet"
        String title
        String description
        String thrustArea
        String uomType "enum: MAX, MIN, ZERO"
        Number target
        Number weightage
        Boolean isShared
    }

    CHECK_IN {
        ObjectId _id PK
        ObjectId goal "Ref: Goal"
        String quarter "enum: Q1, Q2, Q3, Q4"
        Number actualAchievement
        Number achievementPercentage
        String employeeComments
        String managerFeedback
        String status "enum: SUBMITTED, REVIEWED"
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId user "Ref: User"
        String action
        String entity
        ObjectId entityId
        Date timestamp
    }
```

### Core Business Logic Flow (Goal Creation & Approval)
```mermaid
sequenceDiagram
    actor Employee
    actor Manager
    participant ReactUI as Frontend UI
    participant Backend as Express API
    participant DB as MongoDB

    %% Phase 1: Submission
    Employee->>ReactUI: Clicks "Submit for Approval"
    ReactUI->>Backend: PUT /api/goalsheets/:id/submit
    
    Note over Backend: AuthMiddleware verifies JWT<br/>& Employee Role
    
    Backend->>DB: Update GoalSheet status to 'PENDING_APPROVAL'
    DB-->>Backend: Success
    Backend-->>ReactUI: 200 OK (Sheet Submitted)
    ReactUI-->>Employee: Shows Success Notification

    %% Phase 2: Manager Review
    Manager->>ReactUI: Opens Team Approval Dashboard
    ReactUI->>Backend: GET /api/goalsheets/team
    
    Note over Backend: AuthMiddleware verifies JWT<br/>& Manager Role
    
    Backend->>DB: Find GoalSheets where manager = req.user.id
    DB-->>Backend: Return List of Pending Sheets
    Backend-->>ReactUI: 200 OK (List of Sheets)
    ReactUI-->>Manager: Displays Pending Goal Sheets

    %% Phase 3: Manager Approval
    Manager->>ReactUI: Reviews Goals & Clicks "Approve"
    ReactUI->>Backend: PUT /api/goalsheets/:id/approve
    
    Backend->>DB: Update GoalSheet status to 'APPROVED'
    Backend->>DB: Create AuditLog entry "Sheet Approved"
    DB-->>Backend: Success
    Backend-->>ReactUI: 200 OK (Sheet Approved)
    ReactUI-->>Manager: Removes sheet from pending list
```
