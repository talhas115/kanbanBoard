# VibeFlow Kanban Board

A modern, collaborative Kanban board built with ASP.NET Core 8 and React, featuring a sleek Royal Indigo & White theme.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose

### Quick Start
1. Clone the repository.
2. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```
3. Once the containers are running, access the application at:
   **[http://localhost:8085](http://localhost:8085)**

## 🛠 Features
- **Shared Board**: Real-time task visibility across all users.
- **Drag-and-Drop**: Seamless 8-column workflow management.
- **Assignment History**: Track who assigned tasks and when.
- **Time Logging**: Log decimal hours against tasks.
- **Reporting**: Comprehensive time tracking reports for tasks and the entire project.

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate and receive a JWT token.

### Tasks (`/api/tasks`)
- `GET /`: Retrieve all tasks.
- `POST /`: Create a new task.
- `GET /{id}`: Get details for a specific task (including assignment history).
- `PUT /{id}`: Update task title, description, or due date.
- `DELETE /{id}`: Remove a task.
- `POST /{id}/move`: Update task status and order.
- `POST /{id}/assign`: Assign a user to a task.
- `POST /{id}/worklogs`: Log time worked on a task.

### Reports (`/api/tasks/reports`)
- `GET /time`: Get a global time tracking report.

## 🧪 Development & Testing

### Running Backend Tests
```bash
cd backend/VibeFlow.KanbanBoard
dotnet test
```

### Environment Variables
- `Jwt__Secret`: Secret key for JWT signing.
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string.
