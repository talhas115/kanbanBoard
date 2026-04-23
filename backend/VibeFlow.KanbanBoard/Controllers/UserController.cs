using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;

namespace VibeFlow.KanbanBoard.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }
}