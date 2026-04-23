using System.ComponentModel.DataAnnotations;

namespace VibeFlow.KanbanBoard.DTOs;

public class CreateTaskRequest
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public Guid? AssigneeId { get; set; }
}

public class UpdateTaskRequest
{
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public Guid? AssigneeId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class MoveTaskRequest
{
    public int NewOrder { get; set; }
    public string? NewStatus { get; set; }
}

public class AssignmentHistoryResponse
{
    public Guid Id { get; set; }
    public Guid? OldAssigneeId { get; set; }
    public string OldAssigneeEmail { get; set; } = string.Empty;
    public Guid? NewAssigneeId { get; set; }
    public string NewAssigneeEmail { get; set; } = string.Empty;
    public Guid ChangedById { get; set; }
    public string ChangedByEmail { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}

public class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Order { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedById { get; set; }
    public string CreatedByEmail { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public string AssigneeEmail { get; set; } = string.Empty;
    public List<AssignmentHistoryResponse> History { get; set; } = new();
    public List<WorkLogResponse> WorkLogs { get; set; } = new();
}

public class WorkLogResponse
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime LoggedAt { get; set; }
}

public class WorkLogRequest
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Hours { get; set; }

    public string Description { get; set; } = string.Empty;
}


public class TimeReportResponse
{
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public string AssigneeEmail { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
}

public class GlobalTimeReportResponse
{
    public List<TimeReportResponse> TaskReports { get; set; } = new List<TimeReportResponse>();
    public decimal GlobalTotalHours { get; set; }
}