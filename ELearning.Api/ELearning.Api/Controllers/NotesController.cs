using ELearning.Api.DTOs.Notes;
using ELearning.Api.Models;
using ELearning.Api.Persistence; // <--- ZMIANA: Tu by³o .Data, a powinno byæ .Persistence
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("lesson/{lessonId}")]
        public async Task<ActionResult<NoteDto>> GetNote(int lessonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var note = await _context.UserNotes
                .FirstOrDefaultAsync(n => n.LessonId == lessonId && n.UserId == userId);

            if (note == null)
            {
                return Ok(new NoteDto { LessonId = lessonId, Content = "", Title = "Moje Notatki" });
            }

            return Ok(new NoteDto
            {
                LessonId = lessonId,
                Content = note.Content,
                Title = note.Title ?? "Moje Notatki"
            });
        }

        [HttpPost]
        public async Task<IActionResult> SaveNote([FromBody] NoteDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var note = await _context.UserNotes
                .FirstOrDefaultAsync(n => n.LessonId == dto.LessonId && n.UserId == userId);

            if (note == null)
            {
                note = new UserNote
                {
                    UserId = userId,
                    LessonId = dto.LessonId,
                    Content = dto.Content,
                    Title = string.IsNullOrWhiteSpace(dto.Title) ? "Moje Notatki" : dto.Title,
                    LastUpdated = DateTime.UtcNow
                };
                _context.UserNotes.Add(note);
            }
            else
            {
                note.Content = dto.Content;
                note.Title = string.IsNullOrWhiteSpace(dto.Title) ? "Moje Notatki" : dto.Title;
                note.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Notatka zapisana" });
        }
    }
}