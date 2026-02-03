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
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie mo¿na zidentyfikowaæ u¿ytkownika.");
                }

                var courseInfo = await _context.Courses
                    .Where(c => c.Id == courseId)
                    .Select(c => new { c.Id, c.Title, c.InstructorId })
                    .FirstOrDefaultAsync();

                if (courseInfo == null) return NotFound("Kurs nie zosta³ znaleziony.");

                if (courseInfo.InstructorId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid("Nie masz uprawnieñ do przegl¹dania analityki tego kursu.");
                }

                var totalStudents = await _context.Enrollments
                    .CountAsync(e => e.CourseId == courseId);

                var avgQuizScore = 0.0;
                var quizAttempts = _context.UserQuizAttempts
                    .Where(a => a.Quiz.Section.CourseId == courseId);

                if (await quizAttempts.AnyAsync())
                {
                    avgQuizScore = await quizAttempts
                        .Select(a => (double)a.Score)
                        .AverageAsync();
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

                var rawEnrollmentDates = await _context.Enrollments
                    .Where(e => e.CourseId == courseId)
                    .Select(e => e.EnrollmentDate)
                    .ToListAsync();

                var enrollmentGrowth = rawEnrollmentDates
                    .GroupBy(d => d.Date)
                    .Select(g => new EnrollmentDataPoint
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToList();

                var reports = await _context.Notifications
                    .Where(n => n.RelatedEntityId == courseId && (n.Type == "Report" || n.Type == "ContentIssue"))
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
            catch (Exception ex)
            {
                Console.WriteLine($"[Analytics Error] {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, "Wyst¹pi³ wewnêtrzny b³¹d serwera podczas ³adowania analityki.");
            }
        }

        [HttpDelete("report/{reportId}")]
        public async Task<IActionResult> DeleteReport(int reportId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var notification = await _context.Notifications.FindAsync(reportId);
                if (notification == null) return NotFound("Zg³oszenie nie istnieje.");

                var course = await _context.Courses.FindAsync(notification.RelatedEntityId);

                if (course == null) return NotFound("Kurs powi¹zany ze zg³oszeniem nie istnieje.");

                if (course.InstructorId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid("Nie masz uprawnieñ do usuniêcia tego zg³oszenia.");
                }

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Analytics Delete Error] {ex.Message}");
                return StatusCode(500, "Nie uda³o siê usun¹æ zg³oszenia.");
            }
        }
    }
}