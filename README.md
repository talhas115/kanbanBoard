# 🚀 VibeFlow: Enterprise Kanban Engine

VibeFlow is a premium, high-performance Kanban project management system designed for collaborative teams. Built with a modern **ASP.NET Core 8** backend and a **React + Tailwind CSS** frontend, it delivers a state-of-the-art "Jira-like" experience with a focus on speed, precision, and aesthetics.

![Theme](https://img.shields.io/badge/Theme-Vivid_Violet-7c3aed?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Full--Stack-blue?style=for-the-badge)
![Mode](https://img.shields.io/badge/Mode-Support_Dark_Mode-020617?style=for-the-badge)

---

## ✨ Key Global Features

### 🏢 Real-Time Shared Board (KPI 4 & 5)
*   **Live Synchronization**: Background polling ensures all team members see updates (moves, edits, logs) without refreshing.
*   **8-Stage Workflow**: Optimized columns from `Backlog` to `Done` for complete lifecycle tracking.

### 🔍 Advanced Jira-Style Filtering
*   **Quick Search**: Instant board-wide search by task title.
*   **User Avatars**: Clickable round avatars to filter by assignee.
*   **Personal Focus**: One-click "Only My Issues" view.

### ⏱️ Professional Time Auditing (KPI 27, 28, 29)
*   **Granular Work Logs**: Detailed audit trail for every task, including user, hours, description, and timestamps.
*   **Live Metrics**: Every card displays a total time badge (`⏱️ 2.5h`) that updates instantly.
*   **Excel Export**: One-click filtering and export of time reports to `.csv` (Excel/Google Sheets format).

### 🌓 Premium Adaptive UI
*   **Dark Mode**: Full support with a dedicated toggle button.
*   **High-End Aesthetics**: Vivid Violet accents, glassmorphic effects, and smooth transitions.

---

## 🚀 Installation & Setup

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Quick Start
1.  **Clone the project**:
    ```bash
    git clone https://github.com/talhas115/kanbanBoard.git
    cd kanbanBoard
    ```
2.  **Launch with Docker**:
    ```bash
    docker-compose up --build -d
    ```
3.  **Access the Platform**:
    *   **Frontend UI**: [http://localhost:8085](http://localhost:8085)
    *   **API Service**: [http://localhost:5001](http://localhost:5001)

### Default Port Configuration
> [!IMPORTANT]
> The system is configured to run on **Port 8085** to avoid common conflicts with system services (IIS/Skype) on Port 8080.

---

## 🛠 Tech Stack
*   **Backend**: .NET 8 Web API, Entity Framework Core 8, PostgreSQL.
*   **Frontend**: React 18, Tailwind CSS, Zustand (State Management), dnd-kit (UX).
*   **Architecture**: Repository Pattern, JWT Authentication, CORS-enabled.

## 📡 API Endpoints Summary

| Service | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Create a new enterprise account |
| **Auth** | POST | `/api/auth/login` | Secure JWT authentication |
| **Tasks** | GET | `/api/tasks` | Fetch all board tasks |
| **Tasks** | POST | `/api/tasks` | Create a new ticket |
| **Logging**| POST | `/api/tasks/{id}/worklogs` | Record precision work hours |
| **Reports**| GET | `/api/tasks/reports/time` | Generate global auditing data |

---

## 🧪 Testing Summary

To run the backend business logic validation:
```bash
cd backend/VibeFlow.KanbanBoard
dotnet test
```

---
*Created with passion by the VibeFlow Team.*
