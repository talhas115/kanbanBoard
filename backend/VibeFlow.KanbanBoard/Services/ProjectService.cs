using Microsoft.EntityFrameworkCore;
using VibeFlow.KanbanBoard.Data;
using VibeFlow.KanbanBoard.DTOs;
using VibeFlow.KanbanBoard.Models;

namespace VibeFlow.KanbanBoard.Services;

public interface IProjectService
{
    System.Threading.Tasks.Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest request, Guid ownerId);
    System.Threading.Tasks.Task<ProjectResponse> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request);
    System.Threading.Tasks.Task DeleteProjectAsync(Guid projectId);
    System.Threading.Tasks.Task<ProjectResponse> GetProjectAsync(Guid projectId);
    System.Threading.Tasks.Task<List<ProjectResponse>> GetAllProjectsAsync();
}

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest request, Guid ownerId)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Key = request.Key.Trim().ToUpper(),
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            OwnerId = ownerId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return await GetProjectAsync(project.Id);
    }

    public async System.Threading.Tasks.Task<ProjectResponse> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null) throw new KeyNotFoundException("Project not found");

        if (!string.IsNullOrEmpty(request.Name))
            project.Name = request.Name.Trim();
        
        if (request.Description != null)
            project.Description = request.Description;

        await _context.SaveChangesAsync();
        return await GetProjectAsync(projectId);
    }

    public async System.Threading.Tasks.Task DeleteProjectAsync(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project != null)
        {
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task<ProjectResponse> GetProjectAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) throw new KeyNotFoundException("Project not found");

        return MapToResponse(project);
    }

    public async System.Threading.Tasks.Task<List<ProjectResponse>> GetAllProjectsAsync()
    {
        var projects = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Tasks)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapToResponse).ToList();
    }

    private ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Key = project.Key,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            OwnerId = project.OwnerId,
            OwnerEmail = project.Owner?.Email ?? string.Empty,
            TaskCount = project.Tasks?.Count ?? 0
        };
    }
}
