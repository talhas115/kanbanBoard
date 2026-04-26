using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VibeFlow.KanbanBoard.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; }

    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    public ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
    public ICollection<Task> AssignedTasks { get; set; } = new List<Task>();
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}