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
                return NotFound("Kurs nie został znaleziony.");
            }

            _context.CourseReports.RemoveRange(course.Reports);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);

            if (course == null)
            {
                return NotFound("Kurs nie został znaleziony.");
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("reported-comments")]
        public async Task<ActionResult<IEnumerable<ReportedCommentDto>>> GetReportedComments()
        {
            var reportedComments = await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Course)
                .Include(c => c.Reports)
                .Where(c => c.Reports.Any())
                .Select(c => new ReportedCommentDto
                {
                    Id = c.Id,
                    Text = c.Content,
                    Author = c.User.FirstName + " " + c.User.LastName,
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
                return NotFound("Komentarz nie został znaleziony.");
            }

            _context.CommentReports.RemoveRange(comment.Reports);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.Comments
                .Include(c => c.Reports)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                return NotFound("Komentarz nie został znaleziony.");
            }

            var replies = await _context.Comments
                .Where(c => c.ParentCommentId == commentId)
                .ToListAsync();

            if (replies.Any())
            {
                var replyIds = replies.Select(r => r.Id).ToList();
                var replyReports = await _context.CommentReports
                    .Where(cr => replyIds.Contains(cr.CommentId))
                    .ToListAsync();

                _context.CommentReports.RemoveRange(replyReports);
                _context.Comments.RemoveRange(replies);
            }

            _context.CommentReports.RemoveRange(comment.Reports);
            _context.Comments.Remove(comment);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}