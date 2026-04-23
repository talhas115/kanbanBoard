using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.DTOs;
using VibeFlow.KanbanBoard.Models;
using VibeFlow.KanbanBoard.Repositories;
using VibeFlow.KanbanBoard.Services;
using Xunit;
using Task = System.Threading.Tasks.Task;

namespace VibeFlow.KanbanBoard.Tests;

public class TaskServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly TaskService _service;

    public TaskServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        var repository = new TaskRepository(_context);
        _service = new TaskService(repository, _context);
    }

    [Fact]
    public async Task AddWorkLogAsync_ValidHours_CreatesWorkLog()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", PasswordHash = "hash" };
        var task = new Models.Task { Id = Guid.NewGuid(), Title = "Test", Description = "Test Description", Status = "Backlog", Order = 0, CreatedById = user.Id };
        _context.Users.Add(user);
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var request = new WorkLogRequest { Hours = 2.5m, Description = "Test work" };
        var result = await _service.AddWorkLogAsync(task.Id, request, user.Id);

        Assert.NotNull(result);
        Assert.Equal(task.Id, result.TaskId);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(2.5m, result.Hours);
        Assert.Equal("Test work", result.Description);
        Assert.Single(_context.WorkLogs);
    }

    [Fact]
    public async Task AddWorkLogAsync_ZeroHours_ThrowsArgumentException()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", PasswordHash = "hash" };
        var task = new Models.Task { Id = Guid.NewGuid(), Title = "Test", Description = "Test Description", Status = "Backlog", Order = 0, CreatedById = user.Id };
        _context.Users.Add(user);
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var request = new WorkLogRequest { Hours = 0m, Description = "Invalid" };
        await Assert.ThrowsAsync<ArgumentException>(() => _service.AddWorkLogAsync(task.Id, request, user.Id));
    }

    [Fact]
    public async Task AddWorkLogAsync_NegativeHours_ThrowsArgumentException()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", PasswordHash = "hash" };
        var task = new Models.Task { Id = Guid.NewGuid(), Title = "Test", Description = "Test Description", Status = "Backlog", Order = 0, CreatedById = user.Id };
        _context.Users.Add(user);
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var request = new WorkLogRequest { Hours = -1m, Description = "Invalid" };
        await Assert.ThrowsAsync<ArgumentException>(() => _service.AddWorkLogAsync(task.Id, request, user.Id));
    }

    [Fact]
    public async Task AssignTaskAsync_NewAssignee_CreatesHistory()
    {
        var user1 = new User { Id = Guid.NewGuid(), Email = "user1@example.com", PasswordHash = "hash" };
        var user2 = new User { Id = Guid.NewGuid(), Email = "user2@example.com", PasswordHash = "hash" };
        var task = new Models.Task { Id = Guid.NewGuid(), Title = "Test", Description = "Test Description", Status = "Backlog", Order = 0, CreatedById = user1.Id, AssigneeId = user1.Id };
        _context.Users.AddRange(user1, user2);
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _service.AssignTaskAsync(task.Id, user2.Id, user1.Id);

        var updatedTask = await _context.Tasks.FindAsync(task.Id);
        Assert.Equal(user2.Id, updatedTask.AssigneeId);
        var history = await _context.AssignmentHistories.FirstOrDefaultAsync(h => h.TaskId == task.Id);
        Assert.NotNull(history);
        Assert.Equal(user1.Id, history.OldAssigneeId);
        Assert.Equal(user2.Id, history.NewAssigneeId);
        Assert.Equal(user1.Id, history.ChangedById);
    }

    [Fact]
    public async Task AssignTaskAsync_SameAssignee_NoHistory()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@example.com", PasswordHash = "hash" };
        var task = new Models.Task { Id = Guid.NewGuid(), Title = "Test", Description = "Test Description", Status = "Backlog", Order = 0, CreatedById = user.Id, AssigneeId = user.Id };
        _context.Users.Add(user);
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _service.AssignTaskAsync(task.Id, user.Id, user.Id);

        var historyCount = await _context.AssignmentHistories.CountAsync(h => h.TaskId == task.Id);
        Assert.Equal(0, historyCount);
    }

    [Fact]
    public async Task GetTimeReportAsync_AggregatesHoursCorrectly()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@example.com", PasswordHash = "hash" };
        var task1 = new Models.Task { Id = Guid.NewGuid(), Title = "Task 1", Description = "Test Description 1", Status = "Backlog", Order = 0, CreatedById = user.Id };
        var task2 = new Models.Task { Id = Guid.NewGuid(), Title = "Task 2", Description = "Test Description 2", Status = "Todo", Order = 0, CreatedById = user.Id };
        _context.Users.Add(user);
        _context.Tasks.AddRange(task1, task2);
        _context.WorkLogs.AddRange(
            new WorkLog { Id = Guid.NewGuid(), TaskId = task1.Id, UserId = user.Id, Hours = 3, Description = "Work 1", LoggedAt = DateTime.UtcNow },
            new WorkLog { Id = Guid.NewGuid(), TaskId = task1.Id, UserId = user.Id, Hours = 2, Description = "Work 2", LoggedAt = DateTime.UtcNow },
            new WorkLog { Id = Guid.NewGuid(), TaskId = task2.Id, UserId = user.Id, Hours = 1.5m, Description = "Work 3", LoggedAt = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        var report = await _service.GetTimeReportAsync();

        Assert.Equal(2, report.TaskReports.Count);
        var task1Report = report.TaskReports.First(r => r.TaskId == task1.Id);
        Assert.Equal(5m, task1Report.TotalHours);
        var task2Report = report.TaskReports.First(r => r.TaskId == task2.Id);
        Assert.Equal(1.5m, task2Report.TotalHours);
        Assert.Equal(6.5m, report.GlobalTotalHours);
    }
}