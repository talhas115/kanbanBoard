using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.Models;

namespace VibeFlow.KanbanBoard.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<Models.Task?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks
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
            .Include(t => t.ParentTask)
            .Include(t => t.Subtasks)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async System.Threading.Tasks.Task<List<Models.Task>> GetAllAsync()
    {
        return await _context.Tasks
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
            .Include(t => t.ParentTask)
            .Include(t => t.Subtasks)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .OrderBy(t => t.Order)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<Models.Task> CreateAsync(Models.Task task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async System.Threading.Tasks.Task<Models.Task> UpdateAsync(Models.Task task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id)
    {
        var task = await GetByIdAsync(id);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task<List<Models.Task>> GetByStatusAsync(string status)
    {
        return await _context.Tasks
            .Include(t => t.CreatedByUser)
            .Include(t => t.Assignee)
            .Where(t => t.Status == status)
            .OrderBy(t => t.Order)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task UpdateOrderAsync(Guid taskId, int newOrder, string? newStatus)
    {
        var task = await GetByIdAsync(taskId);
        if (task == null) return;

        var oldStatus = task.Status;
        var targetStatus = newStatus ?? oldStatus;

        if (oldStatus != targetStatus)
        {
            var tasksInOldColumn = await _context.Tasks
                .Where(t => t.Status == oldStatus && t.Order > task.Order)
                .ToListAsync();
            foreach (var t in tasksInOldColumn)
            {
                t.Order--;
            }

            var tasksInNewColumn = await _context.Tasks
                .Where(t => t.Status == targetStatus && t.Order >= newOrder)
                .ToListAsync();
            foreach (var t in tasksInNewColumn)
            {
                t.Order++;
            }

            task.Status = targetStatus;
        }
        else
        {
            if (newOrder > task.Order)
            {
                var tasksToShift = await _context.Tasks
                    .Where(t => t.Status == targetStatus && t.Order > task.Order && t.Order <= newOrder)
                    .ToListAsync();
                foreach (var t in tasksToShift)
                {
                    t.Order--;
                }
            }
            else if (newOrder < task.Order)
            {
                var tasksToShift = await _context.Tasks
                    .Where(t => t.Status == targetStatus && t.Order >= newOrder && t.Order < task.Order)
                    .ToListAsync();
                foreach (var t in tasksToShift)
                {
                    t.Order++;
                }
            }
        }

        task.Order = newOrder;
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<List<Models.Task>> GetTasksWithUsersAsync()
    {
        return await _context.Tasks
            .Include(t => t.CreatedByUser)
            .Include(t => t.Assignee)
            .Include(t => t.WorkLogs)
            .ToListAsync();
    }
}