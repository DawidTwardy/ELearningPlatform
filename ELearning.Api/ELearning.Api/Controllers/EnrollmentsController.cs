using ELearning.Api.Models;
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
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("check/{courseId}")]
        public async Task<ActionResult<bool>> CheckEnrollment(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Ok(false);

            var exists = await _context.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);

            return Ok(exists);
        }

        [HttpGet("{courseId}/status")]
        public async Task<ActionResult<object>> GetEnrollmentStatus(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (enrollment == null) return NotFound();

            return Ok(new
            {
                enrollment.EnrollmentDate,
                enrollment.Progress,
                enrollment.IsCompleted
            });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMyEnrollments()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie rozpoznano u¿ytkownika.");
            }

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Where(e => e.UserId == userId)
                .Select(e => new
                {
                    e.Id,
                    e.EnrollmentDate,
                    e.Progress,
                    Course = new
                    {
                        e.Course.Id,
                        e.Course.Title,
                        e.Course.Description,
                        e.Course.Price,
                        e.Course.Category,
                        e.Course.Level,
                        ImageUrl = !string.IsNullOrEmpty(e.Course.ImageUrl) ? e.Course.ImageUrl : "/src/course/placeholder_ai.png",
                        InstructorName = e.Course.Instructor != null ? e.Course.Instructor.UserName : "Instruktor"
                    }
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpPost("{courseId}")]
        public async Task<IActionResult> Enroll(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Musisz byæ zalogowany.");
            }

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound("Kurs nie istnieje.");
            }

            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (existingEnrollment != null)
            {

                return Ok(new { message = "Jesteœ ju¿ zapisany na ten kurs.", enrollmentId = existingEnrollment.Id, alreadyEnrolled = true });
            }

            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = courseId,
                EnrollmentDate = DateTime.UtcNow,
                Progress = 0,
                IsCompleted = false
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zapisano na kurs pomyœlnie.", enrollmentId = enrollment.Id });
        }
    }
}