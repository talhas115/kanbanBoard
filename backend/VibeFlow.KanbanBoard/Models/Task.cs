using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VibeFlow.KanbanBoard.Models;

public class Task
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; }

    public string Description { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public int Order { get; set; }

    public DateTime? DueDate { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public Guid CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public User CreatedByUser { get; set; }

    public Guid? AssigneeId { get; set; }

    [ForeignKey(nameof(AssigneeId))]
    public User Assignee { get; set; }

    public Task()
    {
        AssignmentHistories = new List<AssignmentHistory>();
        WorkLogs = new List<WorkLog>();
        Comments = new List<Comment>();
    }

    public ICollection<AssignmentHistory> AssignmentHistories { get; set; }
    public ICollection<WorkLog> WorkLogs { get; set; }
    public ICollection<Comment> Comments { get; set; }
}