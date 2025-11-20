using ELearning.Api.DTOs.Analytics;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<CourseAnalyticsDto>> GetCourseStats(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return NotFound();
            if (course.InstructorId != userId && !User.IsInRole("Admin")) return Forbid();

            var enrollments = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .ToListAsync();

            var totalStudents = enrollments.Count;

            var quizAttempts = await _context.UserQuizAttempts
                .Include(a => a.Quiz)
                .ThenInclude(q => q.Section)
                .Where(a => a.Quiz.Section.CourseId == courseId)
                .ToListAsync();

            double avgQuizScore = 0;
            if (quizAttempts.Any())
            {
                avgQuizScore = quizAttempts.Average(a => a.Score);
            }

            var totalLessons = await _context.Lessons
                .CountAsync(l => l.Section.CourseId == courseId);

            double completionRate = 0;
            if (totalStudents > 0 && totalLessons > 0)
            {
                var totalCompletions = await _context.LessonCompletions
                    .Include(lc => lc.Lesson)
                    .ThenInclude(l => l.Section)
                    .CountAsync(lc => lc.Lesson.Section.CourseId == courseId);

                double totalPossibleCompletions = totalStudents * totalLessons;
                completionRate = (totalCompletions / totalPossibleCompletions) * 100;
            }

            var enrollmentGrowth = enrollments
                .GroupBy(e => e.EnrollmentDate.Date)
                .Select(g => new EnrollmentDataPoint
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToList();

            var result = new CourseAnalyticsDto
            {
                CourseId = course.Id,
                CourseTitle = course.Title,
                TotalStudents = totalStudents,
                AverageQuizScore = Math.Round(avgQuizScore, 2),
                CompletionRate = Math.Round(completionRate, 2),
                EnrollmentGrowth = enrollmentGrowth
            };

            return Ok(result);
        }
    }
}