using ELearning.Api.Persistence;
using ELearning.Api.Interfaces;
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
        private readonly IGamificationService _gamificationService;

        public ProgressController(ApplicationDbContext context, IGamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<decimal>> GetCourseProgress(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (enrollment == null) return NotFound("Nie jesteœ zapisany na ten kurs.");

            var totalLessons = await _context.Lessons
                .Where(l => l.Section.CourseId == courseId)
                .CountAsync();

            var completedLessons = await _context.LessonCompletions
                .Include(lc => lc.Lesson)
                .ThenInclude(l => l.Section)
                .Where(lc => lc.UserId == userId && lc.Lesson.Section.CourseId == courseId)
                .CountAsync();

            int currentProgress = 0;
            if (totalLessons > 0)
            {
                currentProgress = (int)((double)completedLessons / totalLessons * 100);
            }

            if (enrollment.Progress != currentProgress)
            {
                enrollment.Progress = currentProgress;
                if (currentProgress == 100)
                {
                    enrollment.IsCompleted = true;
                    if (string.IsNullOrEmpty(enrollment.CertificateId))
                    {
                        enrollment.CertificateId = Guid.NewGuid().ToString("N").ToUpper();
                    }
                    await _gamificationService.AddPointsAsync(userId, 100);
                }
                else
                {
                    enrollment.IsCompleted = false;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(currentProgress);
        }

        [HttpGet("course/{courseId}/completed-lessons")]
        public async Task<ActionResult<IEnumerable<int>>> GetCompletedLessons(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var completedLessonIds = await _context.LessonCompletions
                .Include(lc => lc.Lesson)
                .ThenInclude(l => l.Section)
                .Where(lc => lc.UserId == userId && lc.Lesson.Section.CourseId == courseId)
                .Select(lc => lc.LessonId)
                .ToListAsync();

            return Ok(completedLessonIds);
        }

        [HttpGet("course/{courseId}/completed-quizzes")]
        public async Task<ActionResult<IEnumerable<int>>> GetCompletedQuizzes(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var passedQuizIds = await _context.UserQuizAttempts
                .Include(qa => qa.Quiz)
                .ThenInclude(q => q.Section)
                .Where(qa => qa.UserId == userId && qa.Quiz.Section.CourseId == courseId && qa.IsPassed)
                .Select(qa => qa.QuizId)
                .Distinct()
                .ToListAsync();

            return Ok(passedQuizIds);
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

            await _gamificationService.UpdateStreakAsync(userId);
            await _gamificationService.AddPointsAsync(userId, 10);
            await _gamificationService.CheckBadgesAsync(userId);

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

            var totalLessons = await _context.Lessons
                .Where(l => l.Section.CourseId == courseId)
                .CountAsync();

            if (totalLessons == 0) return;

            var completedLessons = await _context.LessonCompletions
                .Include(lc => lc.Lesson)
                .ThenInclude(l => l.Section)
                .Where(lc => lc.UserId == userId && lc.Lesson.Section.CourseId == courseId)
                .CountAsync();

            int progressPercentage = (int)((double)completedLessons / totalLessons * 100);

            enrollment.Progress = progressPercentage;
            if (progressPercentage == 100)
            {
                enrollment.IsCompleted = true;
                if (string.IsNullOrEmpty(enrollment.CertificateId))
                {
                    enrollment.CertificateId = Guid.NewGuid().ToString("N").ToUpper();
                }
                await _gamificationService.AddPointsAsync(userId, 100);
            }
            else
            {
                enrollment.IsCompleted = false;
            }

            await _context.SaveChangesAsync();
        }
    }
}