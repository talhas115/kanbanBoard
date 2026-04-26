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
    public async Task<ActionResult<List<TaskResponse>>> GetAll()
    {
        var tasks = await _taskService.GetAllTasksAsync();
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
    public async Task<ActionResult<TaskResponse>> Create([FromBody] CreateTaskRequest request)
    {
        var userId = GetUserId();
        var task = await _taskService.CreateTaskAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponse>> Update(Guid id, [FromBody] UpdateTaskRequest request)
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
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveTaskRequest request)
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
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTaskRequest request)
    {
        try
        {
            Console.WriteLine($"[DEBUG] Assigning task {id} to {request?.AssigneeId}");
            var userId = GetUserId();
            await _taskService.AssignTaskAsync(id, request.AssigneeId, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Assignment failed: {ex.Message}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("{id}/worklogs")]
    public async Task<ActionResult<WorkLogResponse>> AddWorkLog(Guid id, [FromBody] WorkLogRequest request)
    {
        try
        {
            Console.WriteLine($"[DEBUG] Adding worklog to task {id}: {request.Hours} hrs");
            var userId = GetUserId();
            var response = await _taskService.AddWorkLogAsync(id, request, userId);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] AddWorkLog failed: {ex.Message}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<CommentResponse>> AddComment(Guid id, [FromBody] CommentRequest request)
    {
        try
        {
            Console.WriteLine($"[DEBUG] Adding comment to task {id}: {request.Content}");
            var userId = GetUserId();
            var response = await _taskService.AddCommentAsync(id, request, userId);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] AddComment failed: {ex.Message}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("reports/time")]
    public async Task<ActionResult<GlobalTimeReportResponse>> GetTimeReport()
    {
        var report = await _taskService.GetTimeReportAsync();
        return Ok(report);
    }

    private Guid GetUserId()
    {
        // Try multiple standard claim types for User ID
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("sub")?.Value 
                        ?? User.FindFirst("nameid")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID");
        }
        return userId;
    }
}