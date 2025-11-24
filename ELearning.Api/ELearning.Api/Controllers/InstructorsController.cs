using ELearning.Api.Persistence;
using ELearning.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorsController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public InstructorsController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInstructors()
        {
            var instructors = await _context.Users
                .Where(u => u.Courses.Any()) // Pobieramy tylko tych, którzy maj¹ kursy
                .Include(u => u.Courses)
                .Select(u => new
                {
                    Id = u.Id,
                    Name = $"{u.FirstName} {u.LastName}",
                    // POPRAWKA: Pobieramy avatar z bazy, jeœli null to domyœlny
                    AvatarSrc = !string.IsNullOrEmpty(u.AvatarUrl) ? u.AvatarUrl : "/src/icon/usericon.png",
                    // POPRAWKA: Pobieramy bio z bazy
                    Bio = !string.IsNullOrEmpty(u.Bio) ? u.Bio : "Instruktor na platformie ELearning.",
                    TopCourses = u.Courses
                        .OrderByDescending(c => c.Enrollments.Count)
                        .Take(3)
                        .Select(c => c.Title)
                        .ToList()
                })
                .ToListAsync();

            return Ok(instructors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInstructor(string id)
        {
            var instructor = await _context.Users
                .Include(u => u.Courses)
                .ThenInclude(c => c.Sections) // Wa¿ne do zliczania lekcji
                .ThenInclude(s => s.Lessons)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    Id = u.Id,
                    Name = $"{u.FirstName} {u.LastName}",
                    // POPRAWKA: Pobieramy avatar z bazy
                    AvatarSrc = !string.IsNullOrEmpty(u.AvatarUrl) ? u.AvatarUrl : "/src/icon/usericon.png",
                    // POPRAWKA: Pobieramy bio z bazy
                    Bio = !string.IsNullOrEmpty(u.Bio) ? u.Bio : "Brak opisu instruktora.",
                    Courses = u.Courses.Select(c => new
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Price = c.Price,
                        ImageUrl = c.ImageUrl,
                        Rating = c.Rating,
                        RatingCount = c.RatingCount,
                        Category = c.Category,
                        Level = c.Level,
                        Description = c.Description,
                        // Zliczanie lekcji (z naszej poprzedniej poprawki)
                        LessonsCount = c.Sections.SelectMany(s => s.Lessons).Count()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (instructor == null) return NotFound("Instruktor nie zosta³ znaleziony.");

            return Ok(instructor);
        }
    }
}