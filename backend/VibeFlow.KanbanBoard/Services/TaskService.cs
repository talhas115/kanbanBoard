using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.DTOs;
using VibeFlow.KanbanBoard.Models;
using VibeFlow.KanbanBoard.Repositories;
using Microsoft.AspNetCore.SignalR;
using VibeFlow.KanbanBoard.Hubs;

namespace VibeFlow.KanbanBoard.Services;

public interface ITaskService
{
    System.Threading.Tasks.Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, Guid userId);
    System.Threading.Tasks.Task<TaskResponse> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, Guid userId);
    System.Threading.Tasks.Task DeleteTaskAsync(Guid taskId);
    System.Threading.Tasks.Task<TaskResponse> GetTaskAsync(Guid taskId);
    System.Threading.Tasks.Task<List<TaskResponse>> GetAllTasksAsync();
    System.Threading.Tasks.Task<List<TaskResponse>> GetTasksByStatusAsync(string status);
    System.Threading.Tasks.Task MoveTaskAsync(Guid taskId, MoveTaskRequest request);
    System.Threading.Tasks.Task AssignTaskAsync(Guid taskId, Guid? assigneeId, Guid changedByUserId);
    System.Threading.Tasks.Task<WorkLogResponse> AddWorkLogAsync(Guid taskId, WorkLogRequest request, Guid userId);
    System.Threading.Tasks.Task<CommentResponse> AddCommentAsync(Guid taskId, CommentRequest request, Guid userId);
    System.Threading.Tasks.Task<GlobalTimeReportResponse> GetTimeReportAsync();
}

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<TaskHub> _hubContext;

    public TaskService(ITaskRepository taskRepository, ApplicationDbContext context, IHubContext<TaskHub> hubContext)
    {
        _taskRepository = taskRepository;
        _context = context;
        _hubContext = hubContext;
    }

    public async System.Threading.Tasks.Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, Guid userId)
    {
        var maxOrder = await _context.Tasks
            .Where(t => t.Status == "Backlog")
            .MaxAsync(t => (int?)t.Order) ?? -1;

        var task = new Models.Task
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description,
            Status = "Backlog",
            Order = maxOrder + 1,
            DueDate = request.DueDate,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            AssigneeId = request.AssigneeId
        };

        var created = await _taskRepository.CreateAsync(task);
        
        // Refetch to include navigation properties for the response DTO
        var taskWithIncludes = await _context.Tasks
            .Include(t => t.CreatedByUser)
            .Include(t => t.Assignee)
            .Include(t => t.AssignmentHistories)
                .ThenInclude(h => h.OldAssignee)
            .Include(t => t.AssignmentHistories)
                .ThenInclude(h => h.NewAssignee)
            .Include(t => t.AssignmentHistories)
                .ThenInclude(h => h.ChangedByUser)
            .Include(t => t.WorkLogs)
                .ThenInclude(w => w.User)
            .FirstOrDefaultAsync(t => t.Id == created.Id);

        var response = MapToResponse(taskWithIncludes!);
        await _hubContext.Clients.All.SendAsync("TaskCreated", response);
        return response;
    }

    public async System.Threading.Tasks.Task<TaskResponse> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        if (!string.IsNullOrEmpty(request.Title))
            task.Title = request.Title.Trim();

        // Validation: Due date cannot be in the past (unless it was already in the past and hasn't changed)
        if (request.DueDate.HasValue && request.DueDate.Value.Date < DateTime.UtcNow.Date && request.DueDate != task.DueDate)
        {
            throw new ArgumentException("Due date cannot be in the past");
        }

        // History: Log due date changes
        if (request.DueDate != task.DueDate)
        {
            var oldDate = task.DueDate?.ToString("yyyy-MM-dd") ?? "None";
            var newDate = request.DueDate?.ToString("yyyy-MM-dd") ?? "None";
            var historyComment = new Comment
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                UserId = userId,
                Content = $"📅 Due date changed from {oldDate} to {newDate}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Comments.Add(historyComment);
        }

        // Always apply description and dueDate — allows clearing them
        task.Description = request.Description ?? string.Empty;
        task.DueDate = request.DueDate; // null clears the date

        Console.WriteLine($"[DEBUG] Updating Task {taskId}: Assignee in request={request.AssigneeId}, Current={task.AssigneeId}");

        if (request.AssigneeId != task.AssigneeId)
        {
            await AssignTaskAsync(taskId, request.AssigneeId, userId);
        }

        if (!string.IsNullOrEmpty(request.Status) || request.Order != task.Order)
        {
            await _taskRepository.UpdateOrderAsync(taskId, request.Order, request.Status);
        }
        else
        {
            await _taskRepository.UpdateAsync(task);
        }
        
        await _context.SaveChangesAsync();

        var updated = await _taskRepository.GetByIdAsync(taskId);
        var response = MapToResponse(updated);
        await _hubContext.Clients.All.SendAsync("TaskUpdated", response);
        return response;
    }

    public async System.Threading.Tasks.Task DeleteTaskAsync(Guid taskId)
    {
        await _taskRepository.DeleteAsync(taskId);
        await _hubContext.Clients.All.SendAsync("TaskDeleted", taskId);
    }

    public async System.Threading.Tasks.Task<TaskResponse> GetTaskAsync(Guid taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");
        return MapToResponse(task);
    }

    public async System.Threading.Tasks.Task<List<TaskResponse>> GetAllTasksAsync()
    {
        var tasks = await _taskRepository.GetAllAsync();
        return tasks.Select(MapToResponse).ToList();
    }

    public async System.Threading.Tasks.Task<List<TaskResponse>> GetTasksByStatusAsync(string status)
    {
        var tasks = await _taskRepository.GetByStatusAsync(status);
        return tasks.Select(MapToResponse).ToList();
    }

    public async System.Threading.Tasks.Task MoveTaskAsync(Guid taskId, MoveTaskRequest request)
    {
        await _taskRepository.UpdateOrderAsync(taskId, request.NewOrder, request.NewStatus);
        var task = await _taskRepository.GetByIdAsync(taskId);
        await _hubContext.Clients.All.SendAsync("TaskMoved", MapToResponse(task));
    }

    public async System.Threading.Tasks.Task AssignTaskAsync(Guid taskId, Guid? assigneeId, Guid changedByUserId)
    {
        Console.WriteLine($"[DEBUG] Service: Assigning Task {taskId} to {assigneeId} by {changedByUserId}");
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        if (task.AssigneeId == assigneeId) 
        {
            Console.WriteLine("[DEBUG] Assignee unchanged, skipping.");
            return;
        }

        var history = new AssignmentHistory
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            OldAssigneeId = task.AssigneeId,
            NewAssigneeId = assigneeId,
            ChangedById = changedByUserId,
            ChangedAt = DateTime.UtcNow
        };

        try 
        {
            task.AssigneeId = assigneeId;
            _context.AssignmentHistories.Add(history);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to assign task: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"[INNER ERROR] {ex.InnerException.Message}");
            throw;
        }

        var updatedTask = await _taskRepository.GetByIdAsync(taskId);
        if (updatedTask != null)
        {
            await _hubContext.Clients.All.SendAsync("TaskAssigned", MapToResponse(updatedTask));
        }
    }

    public async System.Threading.Tasks.Task<CommentResponse> AddCommentAsync(Guid taskId, CommentRequest request, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            UserId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        var response = new CommentResponse
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserEmail = user?.Email ?? string.Empty,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };

        await _hubContext.Clients.All.SendAsync("CommentAdded", response);
        return response;
    }

    public async System.Threading.Tasks.Task<WorkLogResponse> AddWorkLogAsync(Guid taskId, WorkLogRequest request, Guid userId)
    {
        if (request.Hours <= 0)
            throw new ArgumentException("Hours must be greater than zero", nameof(request.Hours));

        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        var workLog = new WorkLog
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            UserId = userId,
            Hours = request.Hours,
            Description = request.Description,
            LoggedAt = DateTime.UtcNow
        };

        _context.WorkLogs.Add(workLog);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        var response = new WorkLogResponse
        {
            Id = workLog.Id,
            TaskId = workLog.TaskId,
            UserId = workLog.UserId,
            UserEmail = user?.Email ?? string.Empty,
            Hours = workLog.Hours,
            Description = workLog.Description,
            LoggedAt = workLog.LoggedAt
        };

        await _hubContext.Clients.All.SendAsync("WorkLogged", response);
        return response;
    }

    public async System.Threading.Tasks.Task<GlobalTimeReportResponse> GetTimeReportAsync()
    {
        var tasks = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.WorkLogs)
            .ToListAsync();

        var report = tasks.Select(t => new TimeReportResponse
        {
            TaskId = t.Id,
            TaskTitle = t.Title,
            Status = t.Status,
            AssigneeId = t.AssigneeId,
            AssigneeEmail = t.Assignee != null ? t.Assignee.Email : null,
            TotalHours = t.WorkLogs?.Sum(wl => wl.Hours) ?? 0
        }).ToList();

        var globalTotal = report.Sum(r => r.TotalHours);

        return new GlobalTimeReportResponse
        {
            TaskReports = report,
            GlobalTotalHours = globalTotal
        };
    }

    private TaskResponse MapToResponse(Models.Task task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Order = task.Order,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            CreatedById = task.CreatedById,
            CreatedByEmail = task.CreatedByUser?.Email ?? string.Empty,
            AssigneeId = task.AssigneeId,
            AssigneeEmail = task.Assignee?.Email ?? string.Empty,
            History = task.AssignmentHistories?
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new AssignmentHistoryResponse
                {
                    Id = h.Id,
                    OldAssigneeId = h.OldAssigneeId,
                    OldAssigneeEmail = h.OldAssignee?.Email ?? "Unassigned",
                    NewAssigneeId = h.NewAssigneeId,
                    NewAssigneeEmail = h.NewAssignee?.Email ?? "Unassigned",
                    ChangedById = h.ChangedById,
                    ChangedByEmail = h.ChangedByUser?.Email ?? string.Empty,
                    ChangedAt = h.ChangedAt
                }).ToList() ?? new List<AssignmentHistoryResponse>(),
            WorkLogs = task.WorkLogs?
                .OrderByDescending(w => w.LoggedAt)
                .Select(w => new WorkLogResponse
                {
                    Id = w.Id,
                    TaskId = w.TaskId,
                    UserId = w.UserId,
                    UserEmail = w.User?.Email ?? string.Empty,
                    Hours = w.Hours,
                    Description = w.Description ?? string.Empty,
                    LoggedAt = w.LoggedAt
                }).ToList() ?? new List<WorkLogResponse>(),
            Comments = task.Comments?
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentResponse
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserEmail = c.User?.Email ?? string.Empty,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList() ?? new List<CommentResponse>()
        };
    }
}