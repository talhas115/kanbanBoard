using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VibeFlow.KanbanBoard.Models;

public class AssignmentHistory
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid TaskId { get; set; }

    [ForeignKey(nameof(TaskId))]
    public Task Task { get; set; }

    public Guid? OldAssigneeId { get; set; }

    [ForeignKey(nameof(OldAssigneeId))]
    public User OldAssignee { get; set; }

    public Guid? NewAssigneeId { get; set; }

    [ForeignKey(nameof(NewAssigneeId))]
    public User NewAssignee { get; set; }

    [Required]
    public Guid ChangedById { get; set; }

    [ForeignKey(nameof(ChangedById))]
    public User ChangedByUser { get; set; }

    [Required]
    public DateTime ChangedAt { get; set; }
}