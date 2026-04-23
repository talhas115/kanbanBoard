namespace VibeFlow.KanbanBoard.Repositories;

public interface ITaskRepository
{
    System.Threading.Tasks.Task<Models.Task?> GetByIdAsync(Guid id);
    System.Threading.Tasks.Task<List<Models.Task>> GetAllAsync();
    System.Threading.Tasks.Task<Models.Task> CreateAsync(Models.Task task);
    System.Threading.Tasks.Task<Models.Task> UpdateAsync(Models.Task task);
    System.Threading.Tasks.Task DeleteAsync(Guid id);
    System.Threading.Tasks.Task<List<Models.Task>> GetByStatusAsync(string status);
    System.Threading.Tasks.Task UpdateOrderAsync(Guid taskId, int newOrder, string? newStatus);
    System.Threading.Tasks.Task<List<Models.Task>> GetTasksWithUsersAsync();
}