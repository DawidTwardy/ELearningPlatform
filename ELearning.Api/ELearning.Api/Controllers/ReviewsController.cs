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

            // SprawdŸ czy u¿ytkownik jest zapisany na kurs
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == dto.CourseId && e.UserId == userId);

            if (enrollment == null)
            {
                return BadRequest(new { message = "Musisz byæ zapisany na kurs, aby dodaæ recenzjê." });
            }

            // SprawdŸ czy u¿ytkownik ju¿ nie oceni³ tego kursu
            var existingReview = await _context.CourseReviews
                .FirstOrDefaultAsync(r => r.CourseId == dto.CourseId && r.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest(new { message = "Ju¿ oceni³eœ ten kurs." });
            }

            // 1. Utwórz now¹ recenzjê i dodaj do kontekstu (jeszcze nie zapisujemy)
            var review = new CourseReview
            {
                CourseId = dto.CourseId,
                UserId = userId,
                Rating = dto.Rating,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.CourseReviews.Add(review);

            // 2. Pobierz kurs i zaktualizuj jego œredni¹ ocenê
            var course = await _context.Courses.FindAsync(dto.CourseId);
            if (course != null)
            {
                // Pobieramy listê DOTYCHCZASOWYCH ocen z bazy (bez tej nowej, bo ona jest jeszcze w pamiêci)
                var existingRatings = await _context.CourseReviews
                    .Where(r => r.CourseId == dto.CourseId)
                    .Select(r => r.Rating)
                    .ToListAsync();

                // Dodajemy now¹ ocenê do listy w pamiêci, aby wyliczyæ now¹ œredni¹
                existingRatings.Add(dto.Rating);

                // Aktualizujemy pola w encji Course
                course.Rating = Math.Round(existingRatings.Average(), 1);
                course.RatingCount = existingRatings.Count;
            }

            // 3. Zapisujemy wszystko (Recenzjê i aktualizacjê Kursu) w jednej transakcji
            await _context.SaveChangesAsync();

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
    }
}