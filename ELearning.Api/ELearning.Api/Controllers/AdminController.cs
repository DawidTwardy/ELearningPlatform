using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ELearning.Api.Models;
using ELearning.Api.DTOs.Admin;
using ELearning.Api.Models.CourseContent;

namespace ELearning.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("reported-courses")]
        public async Task<ActionResult<IEnumerable<ReportedCourseDto>>> GetReportedCourses()
        {
            // Pobiera tylko kursy z aktywnymi zg³oszeniami
            var reportedCourses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Reports)
                .Include(c => c.Reviews)
                .Where(c => c.Reports.Any())
                .Select(c => new ReportedCourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Instructor = c.Instructor.FirstName + " " + c.Instructor.LastName,
                    Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                    ImageSrc = c.ImageUrl,
                    ReportCount = c.Reports.Count,
                    LastReported = c.Reports.Max(r => r.ReportedAt)
                })
                .OrderByDescending(c => c.ReportCount)
                .ToListAsync();

            return Ok(reportedCourses);
        }

        [HttpPost("courses/{courseId}/ignore-report")]
        public async Task<IActionResult> IgnoreCourseReport(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Reports)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                return NotFound("Kurs nie zosta³ znaleziony.");
            }

            // Usuñ wszystkie zg³oszenia, ale zachowaj kurs
            _context.CourseReports.RemoveRange(course.Reports);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }

        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);

            if (course == null)
            {
                return NotFound("Kurs nie zosta³ znaleziony.");
            }

            // W prawdziwej aplikacji usuniêcie kursu wymaga³oby kaskadowego usuniêcia wielu powi¹zanych danych
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }


        [HttpGet("reported-comments")]
        public async Task<ActionResult<IEnumerable<ReportedCommentDto>>> GetReportedComments()
        {
            // Pobiera tylko komentarze z aktywnymi zg³oszeniami
            var reportedComments = await _context.Comments
                .Include(c => c.User) // U¿ywa poprawn¹ relacjê do ApplicationUser (User)
                .Include(c => c.Course)
                .Include(c => c.Reports)
                .Where(c => c.Reports.Any())
                .Select(c => new ReportedCommentDto
                {
                    Id = c.Id,
                    Text = c.Content,
                    Author = c.User.FirstName + " " + c.User.LastName, // U¿ywa c.User
                    CourseTitle = c.Course.Title,
                    ReportCount = c.Reports.Count,
                    LastReported = c.Reports.Max(r => r.ReportedAt)
                })
                .OrderByDescending(c => c.ReportCount)
                .ToListAsync();

            return Ok(reportedComments);
        }

        [HttpPost("comments/{commentId}/keep")]
        public async Task<IActionResult> KeepComment(int commentId)
        {
            var comment = await _context.Comments
                .Include(c => c.Reports)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                return NotFound("Komentarz nie zosta³ znaleziony.");
            }

            // Usuñ wszystkie zg³oszenia, ale zachowaj komentarz
            _context.CommentReports.RemoveRange(comment.Reports);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);

            if (comment == null)
            {
                return NotFound("Komentarz nie zosta³ znaleziony.");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }

    }
}