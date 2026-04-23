using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VibeFlow.KanbanBoard.Models;

public class WorkLog
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid TaskId { get; set; }

    [ForeignKey(nameof(TaskId))]
    public Task Task { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Hours { get; set; }

    public string Description { get; set; }

    [Required]
    public DateTime LoggedAt { get; set; }
}