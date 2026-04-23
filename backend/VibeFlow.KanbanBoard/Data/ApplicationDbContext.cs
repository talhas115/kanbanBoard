using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Models;

namespace VibeFlow.KanbanBoard.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<AssignmentHistory> AssignmentHistories { get; set; }
    public DbSet<WorkLog> WorkLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Task>()
            .HasOne(t => t.CreatedByUser)
            .WithMany(u => u.CreatedTasks)
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Models.Task>()
            .HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AssignmentHistory>()
            .HasOne(ah => ah.Task)
            .WithMany(t => t.AssignmentHistories)
            .HasForeignKey(ah => ah.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssignmentHistory>()
            .HasOne(ah => ah.OldAssignee)
            .WithMany(u => u.AssignmentHistories)
            .HasForeignKey(ah => ah.OldAssigneeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AssignmentHistory>()
            .HasOne(ah => ah.NewAssignee)
            .WithMany()
            .HasForeignKey(ah => ah.NewAssigneeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AssignmentHistory>()
            .HasOne(ah => ah.ChangedByUser)
            .WithMany()
            .HasForeignKey(ah => ah.ChangedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkLog>()
            .HasOne(wl => wl.Task)
            .WithMany(t => t.WorkLogs)
            .HasForeignKey(wl => wl.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkLog>()
            .HasOne(wl => wl.User)
            .WithMany(u => u.WorkLogs)
            .HasForeignKey(wl => wl.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}