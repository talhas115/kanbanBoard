using System.ComponentModel.DataAnnotations;

namespace VibeFlow.KanbanBoard.DTOs;

public class CreateProjectRequest
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Key { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public class UpdateProjectRequest
{
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public class ProjectResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public int TaskCount { get; set; }
}
