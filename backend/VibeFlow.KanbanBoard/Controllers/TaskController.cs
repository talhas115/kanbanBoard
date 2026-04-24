using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VibeFlow.KanbanBoard.DTOs;
using VibeFlow.KanbanBoard.Services;

namespace VibeFlow.KanbanBoard.Controllers;

[Authorize]
[ApiController]
[Route("api/tasks")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskResponse>>> GetAll(Guid? projectId)
    {
        var tasks = await _taskService.GetAllTasksAsync(projectId);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponse>> GetById(Guid id)
    {
        try
        {
            var task = await _taskService.GetTaskAsync(id);
            return Ok(task);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create(CreateTaskRequest request)
    {
        var userId = GetUserId();
        var task = await _taskService.CreateTaskAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponse>> Update(Guid id, UpdateTaskRequest request)
    {
        try
        {
            var userId = GetUserId();
            var task = await _taskService.UpdateTaskAsync(id, request, userId);
            return Ok(task);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/move")]
    public async Task<IActionResult> Move(Guid id, MoveTaskRequest request)
    {
        try
        {
            await _taskService.MoveTaskAsync(id, request);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] Guid? assigneeId)
    {
        try
        {
            var userId = GetUserId();
            await _taskService.AssignTaskAsync(id, assigneeId, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/worklogs")]
    public async Task<ActionResult<WorkLogResponse>> AddWorkLog(Guid id, WorkLogRequest request)
    {
        try
        {
            var userId = GetUserId();
            var workLog = await _taskService.AddWorkLogAsync(id, request, userId);
            return Ok(workLog);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<CommentResponse>> AddComment(Guid id, CommentRequest request)
    {
        try
        {
            var userId = GetUserId();
            var comment = await _taskService.AddCommentAsync(id, request, userId);
            return Ok(comment);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("reports/time")]
    public async Task<ActionResult<GlobalTimeReportResponse>> GetTimeReport(Guid? projectId)
    {
        var report = await _taskService.GetTimeReportAsync(projectId);
        return Ok(report);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID");
        }
        return userId;
    }
}