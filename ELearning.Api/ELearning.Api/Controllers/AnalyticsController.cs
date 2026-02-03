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
    [Authorize]
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

            var courseInfo = await _context.Courses
                .Where(c => c.Id == courseId)
                .Select(c => new { c.Id, c.Title, c.InstructorId })
                .FirstOrDefaultAsync();

            if (courseInfo == null) return NotFound("Kurs nie został znaleziony.");

            if (courseInfo.InstructorId != userId && !User.IsInRole("Admin")) return Forbid();

            var totalStudents = await _context.Enrollments
                .CountAsync(e => e.CourseId == courseId);

            var quizAttempts = await _context.UserQuizAttempts
                .Where(a => a.Quiz.Section.CourseId == courseId)
                .Select(a => new {
                    AchievedScore = (double)a.Score,
                    MaxScore = (double)a.Quiz.Questions.Count
                })
                .ToListAsync();

            double avgQuizScore = 0;
            if (quizAttempts.Any())
            {
                avgQuizScore = quizAttempts
                    .Select(a => a.MaxScore > 0 ? (a.AchievedScore / a.MaxScore) * 100 : 0)
                    .Average();
            }

            var totalLessons = await _context.Lessons
                .CountAsync(l => l.Section.CourseId == courseId);

            var totalCompletions = await _context.LessonCompletions
                .CountAsync(lc => lc.Lesson.Section.CourseId == courseId);

            double completionRate = 0;
            if (totalStudents > 0 && totalLessons > 0)
            {
                double totalPossibleCompletions = (double)totalStudents * totalLessons;
                completionRate = (totalCompletions / totalPossibleCompletions) * 100;
            }

            var rawEnrollmentData = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .GroupBy(e => e.EnrollmentDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var enrollmentGrowth = rawEnrollmentData
                .Select(x => new EnrollmentDataPoint
                {
                    Date = x.Date.ToString("yyyy-MM-dd"),
                    Count = x.Count
                })
                .ToList();

            var reports = await _context.Notifications
                .Where(n => n.RelatedEntityId == courseId && n.Type == "Report")
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new CourseReportDto
                {
                    Id = n.Id,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead
                })
                .ToListAsync();

            var result = new CourseAnalyticsDto
            {
                CourseId = courseInfo.Id,
                CourseTitle = courseInfo.Title,
                TotalStudents = totalStudents,
                AverageQuizScore = Math.Round(avgQuizScore, 2),
                CompletionRate = Math.Round(completionRate, 2),
                EnrollmentGrowth = enrollmentGrowth,
                Reports = reports
            };

            return Ok(result);
        }
    }
}