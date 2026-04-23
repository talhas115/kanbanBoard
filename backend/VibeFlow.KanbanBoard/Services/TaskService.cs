using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.DTOs;
using VibeFlow.KanbanBoard.Models;
using VibeFlow.KanbanBoard.Repositories;

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
    System.Threading.Tasks.Task<GlobalTimeReportResponse> GetTimeReportAsync();
}

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ApplicationDbContext _context;

    public TaskService(ITaskRepository taskRepository, ApplicationDbContext context)
    {
        _taskRepository = taskRepository;
        _context = context;
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

        return MapToResponse(taskWithIncludes!);
    }

    public async System.Threading.Tasks.Task<TaskResponse> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        if (!string.IsNullOrEmpty(request.Title))
            task.Title = request.Title.Trim();
        
        if (request.Description != null)
            task.Description = request.Description;
        
        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate;

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

        var updated = await _taskRepository.GetByIdAsync(taskId);
        return MapToResponse(updated);
    }

    public async System.Threading.Tasks.Task DeleteTaskAsync(Guid taskId)
    {
        await _taskRepository.DeleteAsync(taskId);
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
    }

    public async System.Threading.Tasks.Task AssignTaskAsync(Guid taskId, Guid? assigneeId, Guid changedByUserId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException("Task not found");

        if (task.AssigneeId == assigneeId) return;

        var history = new AssignmentHistory
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            OldAssigneeId = task.AssigneeId,
            NewAssigneeId = assigneeId,
            ChangedById = changedByUserId,
            ChangedAt = DateTime.UtcNow
        };

        task.AssigneeId = assigneeId;
        _context.AssignmentHistories.Add(history);
        await _context.SaveChangesAsync();
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
        return new WorkLogResponse
        {
            Id = workLog.Id,
            TaskId = workLog.TaskId,
            UserId = workLog.UserId,
            UserEmail = user?.Email ?? string.Empty,
            Hours = workLog.Hours,
            Description = workLog.Description,
            LoggedAt = workLog.LoggedAt
        };
    }

    public async System.Threading.Tasks.Task<GlobalTimeReportResponse> GetTimeReportAsync()
    {
        var report = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.WorkLogs)
            .Select(t => new TimeReportResponse
            {
                TaskId = t.Id,
                TaskTitle = t.Title,
                Status = t.Status,
                AssigneeId = t.AssigneeId,
                AssigneeEmail = t.Assignee != null ? t.Assignee.Email : null,
                TotalHours = t.WorkLogs.Sum(wl => wl.Hours)
            })
            .ToListAsync();

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
                }).ToList() ?? new List<WorkLogResponse>()
        };
    }
}