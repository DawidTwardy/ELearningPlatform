using ELearning.Api.DTOs.Reviews;
using ELearning.Api.Models;
using ELearning.Api.Models.CourseContent;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == dto.CourseId && e.UserId == userId);

            if (enrollment == null)
            {
                // POPRAWKA: Zwracamy obiekt JSON zamiast stringa
                return BadRequest(new { message = "Musisz byæ zapisany na kurs, aby dodaæ recenzjê." });
            }

            var existingReview = await _context.CourseReviews
                .FirstOrDefaultAsync(r => r.CourseId == dto.CourseId && r.UserId == userId);

            if (existingReview != null)
            {
                // POPRAWKA: Zwracamy obiekt JSON
                return BadRequest(new { message = "Ju¿ oceni³eœ ten kurs." });
            }

            var review = new CourseReview
            {
                CourseId = dto.CourseId,
                UserId = userId,
                Rating = dto.Rating,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.CourseReviews.Add(review);
            await _context.SaveChangesAsync();

            await RecalculateCourseRating(dto.CourseId);

            return Ok(new { message = "Recenzja dodana pomyœlnie." });
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetCourseReviews(int courseId)
        {
            var reviews = await _context.CourseReviews
                .Include(r => r.User)
                .Where(r => r.CourseId == courseId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserName = r.User.UserName ?? "U¿ytkownik",
                    UserAvatar = "/src/icon/usericon.png",
                    Rating = r.Rating,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        private async Task RecalculateCourseRating(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return;

            var ratings = await _context.CourseReviews
                .Where(r => r.CourseId == courseId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (ratings.Any())
            {
                course.Rating = Math.Round(ratings.Average(), 1);
                course.RatingCount = ratings.Count;
            }
            else
            {
                course.Rating = 0;
                course.RatingCount = 0;
            }

            await _context.SaveChangesAsync();
        }
    }
}