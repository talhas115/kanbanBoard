using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.Models;
using System;
using System.Linq;
using System.Collections.Generic;

namespace VibeFlow.KanbanBoard.Data;

public static class DbInitializer
{
    public static void Seed(ApplicationDbContext context)
    {
        if (context.Users.Any()) return;

        // Seed Users
        var users = new List<User>
        {
            new User
            {
                Id = Guid.NewGuid(),
                Email = "zeeshan@neosoftmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@vibeflow.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        // Seed Tasks
        var zeeshan = users.First();
        var admin = users.Last();
        var tasks = new List<VibeFlow.KanbanBoard.Models.Task>
        {
            new VibeFlow.KanbanBoard.Models.Task
            {
                Id = Guid.NewGuid(),
                Title = "Implement Real-Time Dashboard",
                Description = "Use SignalR to synchronize board across clients.",
                Status = "In Progress",
                Order = 0,
                CreatedById = zeeshan.Id,
                AssigneeId = zeeshan.Id,
                CreatedAt = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(3)
            },
            new VibeFlow.KanbanBoard.Models.Task
            {
                Id = Guid.NewGuid(),
                Title = "Audit Logging System",
                Description = "Track all changes to project tasks.",
                Status = "Todo",
                Order = 0,
                CreatedById = zeeshan.Id,
                CreatedAt = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(7)
            },
            new VibeFlow.KanbanBoard.Models.Task
            {
                Id = Guid.NewGuid(),
                Title = "Performance Optimization",
                Description = "Improve load time of Kanban Board.",
                Status = "Backlog",
                Order = 0,
                CreatedById = zeeshan.Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Tasks.AddRange(tasks);
        context.SaveChanges();

        var task1 = tasks.First();

        // Seed Comments
        var comments = new List<Comment>
        {
            new Comment
            {
                Id = Guid.NewGuid(),
                TaskId = task1.Id,
                UserId = admin.Id,
                Content = "Great start on the hub implementation! Let's ensure we handle reconnection gracefully.",
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new Comment
            {
                Id = Guid.NewGuid(),
                TaskId = task1.Id,
                UserId = zeeshan.Id,
                Content = "Thanks! I've added automatic reconnect to the store. Testing it now.",
                CreatedAt = DateTime.UtcNow.AddMinutes(-30)
            }
        };
        context.Comments.AddRange(comments);
        context.SaveChanges();

        // Seed WorkLogs
        var logs = new List<WorkLog>
        {
            new WorkLog
            {
                Id = Guid.NewGuid(),
                TaskId = task1.Id,
                UserId = zeeshan.Id,
                Hours = 2.5m,
                Description = "Initial setup and hub configuration",
                LoggedAt = DateTime.UtcNow.AddHours(-2)
            }
        };

        context.WorkLogs.AddRange(logs);
        context.SaveChanges();
    }
}
