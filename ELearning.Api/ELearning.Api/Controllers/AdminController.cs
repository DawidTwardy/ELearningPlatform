using ELearning.Api.DTOs.Admin;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("reported-courses")]
        public async Task<ActionResult<IEnumerable<ReportedCourseDto>>> GetReportedCourses()
        {
            var reports = await _context.CourseReports
                .Include(r => r.Course)
                .ThenInclude(c => c.Instructor)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReportedCourseDto
                {
                    Id = r.Id,
                    CourseId = r.CourseId,
                    CourseTitle = r.Course.Title,
                    InstructorName = r.Course.Instructor.FirstName + " " + r.Course.Instructor.LastName,
                    Reason = r.Reason,
                    ReportedAt = r.CreatedAt,
                    Status = r.Status
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("reported-comments")]
        public async Task<ActionResult<IEnumerable<ReportedCommentDto>>> GetReportedComments()
        {
            var reports = await _context.CommentReports
                .Include(r => r.Comment)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReportedCommentDto
                {
                    Id = r.Id,
                    CommentId = r.CommentId,
                    Content = r.Comment.Content,
                    Reason = r.Reason,
                    ReportedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPost("courses/{courseId}/ignore-report")]
        public async Task<IActionResult> IgnoreCourseReport(int courseId)
        {
            var reports = await _context.CourseReports
                .Where(r => r.CourseId == courseId)
                .ToListAsync();

            if (!reports.Any()) return NotFound("Brak zg³oszeñ dla tego kursu.");

            _context.CourseReports.RemoveRange(reports);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenia zosta³y zignorowane i usuniête." });
        }

        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteReportedCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Kurs nie istnieje.");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kurs zosta³ usuniêty." });
        }

        [HttpPost("comments/{commentId}/keep")]
        public async Task<IActionResult> KeepComment(int commentId)
        {
            var reports = await _context.CommentReports
                .Where(r => r.CommentId == commentId)
                .ToListAsync();

            if (!reports.Any()) return NotFound("Brak zg³oszeñ dla tego komentarza.");

            _context.CommentReports.RemoveRange(reports);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenia komentarza zosta³y usuniête, komentarz zachowany." });
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteReportedComment(int commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return NotFound("Komentarz nie istnieje.");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Komentarz zosta³ usuniêty." });
        }
    }
}