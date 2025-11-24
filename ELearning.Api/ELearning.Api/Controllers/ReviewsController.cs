using ELearning.Api.DTOs.Reviews;
using ELearning.Api.Models;
using ELearning.Api.Models.CourseContent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ELearning.Api.Persistence;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReviewsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.CourseId == model.CourseId && r.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest("Ju¿ doda³eœ opiniê do tego kursu.");
            }

            var review = new CourseReview
            {
                CourseId = model.CourseId,
                UserId = userId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedDate = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Opinia dodana." });
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetReviews(int courseId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.CourseId == courseId)
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

            var reviewDtos = reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                UserName = r.User.UserName,
                AvatarUrl = r.User.AvatarUrl, 
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedDate = r.CreatedDate
            });

            return Ok(reviewDtos);
        }
    }
}