using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgressController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<decimal>> GetCourseProgress(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (enrollment == null) return NotFound("Nie jesteœ zapisany na ten kurs.");

            return Ok(enrollment.Progress);
        }

        [HttpPost("lesson/{lessonId}/complete")]
        public async Task<IActionResult> MarkLessonAsCompleted(int lessonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var lesson = await _context.Lessons
                .Include(l => l.Section)
                .ThenInclude(s => s.Course)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null) return NotFound("Lekcja nie istnieje.");

            // SprawdŸ czy lekcja jest ju¿ ukoñczona
            var existingCompletion = await _context.LessonCompletions
                .FirstOrDefaultAsync(lc => lc.LessonId == lessonId && lc.UserId == userId);

            if (existingCompletion != null) return Ok(new { message = "Lekcja ju¿ ukoñczona" });

            var completion = new Models.LessonCompletion
            {
                LessonId = lessonId,
                UserId = userId,
                CompletedAt = DateTime.UtcNow
            };

            _context.LessonCompletions.Add(completion);
            await _context.SaveChangesAsync();

            // Aktualizuj postêp kursu w Enrollment
            await UpdateEnrollmentProgress(userId, lesson.Section.Course.Id);

            return Ok(new { success = true });
        }

        [HttpGet("lesson/{lessonId}/completion")]
        public async Task<ActionResult<bool>> CheckLessonCompletion(int lessonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Ok(false);

            var isCompleted = await _context.LessonCompletions
                .AnyAsync(lc => lc.LessonId == lessonId && lc.UserId == userId);

            return Ok(isCompleted);
        }

        private async Task UpdateEnrollmentProgress(string userId, int courseId)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null) return;

            // Policz wszystkie lekcje w kursie
            var totalLessons = await _context.Lessons
                .Where(l => l.Section.CourseId == courseId)
                .CountAsync();

            if (totalLessons == 0) return;

            // Policz ukoñczone lekcje dla tego kursu
            var completedLessons = await _context.LessonCompletions
                .Include(lc => lc.Lesson)
                .ThenInclude(l => l.Section)
                .Where(lc => lc.UserId == userId && lc.Lesson.Section.CourseId == courseId)
                .CountAsync();

            int progressPercentage = (int)((double)completedLessons / totalLessons * 100);

            // Zapisz postêp
            enrollment.Progress = progressPercentage;
            if (progressPercentage == 100)
            {
                enrollment.IsCompleted = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}