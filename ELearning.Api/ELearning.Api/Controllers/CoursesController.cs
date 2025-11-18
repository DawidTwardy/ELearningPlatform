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
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
                .ToListAsync();

            var result = courses.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Category,
                c.Level,
                c.Price,
                ImageSrc = c.ImageUrl,
                ImageUrl = c.ImageUrl,
                Rating = 0,
                Instructor = c.Instructor != null ? new { Name = c.Instructor.UserName, Bio = "Instruktor" } : null
            });

            return Ok(result);
        }

        [HttpGet("my-courses")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetInstructorCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie rozpoznano użytkownika.");
            }

            var courses = await _context.Courses
                .Where(c => c.InstructorId == userId)
                .Include(c => c.Instructor)
                .ToListAsync();

            var result = courses.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Category,
                c.Level,
                c.Price,
                ImageSrc = c.ImageUrl,
                ImageUrl = c.ImageUrl,
                Rating = 0,
                Instructor = c.Instructor != null ? new { Name = c.Instructor.UserName, Bio = "Instruktor" } : null
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                .Include(c => c.Sections)
                .ThenInclude(s => s.Quiz)
                .ThenInclude(q => q.Questions)
                .ThenInclude(qt => qt.Options)
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            var result = new
            {
                course.Id,
                course.Title,
                course.Description,
                course.Category,
                course.Level,
                course.Price,
                ImageSrc = course.ImageUrl,
                ImageUrl = course.ImageUrl,
                Rating = 0,
                Instructor = course.Instructor != null ? new
                {
                    Name = course.Instructor.UserName,
                    AvatarSrc = "/src/icon/usericon.png",
                    Bio = "Instruktor"
                } : null,
                Sections = course.Sections.Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Order,
                    Lessons = s.Lessons.Select(l => new
                    {
                        l.Id,
                        l.Title,
                        l.Content,
                        l.VideoUrl
                    }),
                    Quiz = s.Quiz != null ? new
                    {
                        s.Quiz.Id,
                        s.Quiz.Title,
                        Questions = s.Quiz.Questions.Select(q => new
                        {
                            q.Id,
                            q.Text,
                            q.QuestionType,
                            Options = q.Options.Select(o => new { o.Id, o.Text, o.IsCorrect })
                        })
                    } : null
                })
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<ActionResult<object>> CreateCourse(Course course)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { title = "Nie udało się zidentyfikować użytkownika. Zaloguj się ponownie." });
                }

                course.InstructorId = userId;

                if (string.IsNullOrEmpty(course.ImageUrl))
                {
                    course.ImageUrl = "/src/course/placeholder_ai.png";
                }

                if (course.Sections == null) course.Sections = new List<CourseSection>();

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                var result = new
                {
                    course.Id,
                    course.Title,
                    course.Description,
                    course.Category,
                    course.Level,
                    course.Price,
                    ImageSrc = course.ImageUrl,
                    ImageUrl = course.ImageUrl,
                    Rating = 0,
                    Instructor = new { Name = User.Identity?.Name ?? "Ja", Bio = "Instruktor" },
                    Sections = course.Sections.Select(s => new
                    {
                        s.Id,
                        s.Title,
                        s.Order,
                        Lessons = s.Lessons.Select(l => new
                        {
                            l.Id,
                            l.Title,
                            l.Content,
                            l.VideoUrl
                        }),
                        Quiz = s.Quiz != null ? new
                        {
                            s.Quiz.Id,
                            s.Quiz.Title
                        } : null
                    })
                };

                return StatusCode(201, result);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException != null ? ex.InnerException.Message : "";
                return StatusCode(500, new { title = $"Błąd serwera: {ex.Message} {innerMessage}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<IActionResult> UpdateCourse(int id, Course course)
        {
            if (id != course.Id)
            {
                return BadRequest();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var existingCourse = await _context.Courses.FindAsync(id);

            if (existingCourse == null) return NotFound();

            if (existingCourse.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.Category = course.Category;
            existingCourse.Level = course.Level;
            existingCourse.Price = course.Price;
            if (!string.IsNullOrEmpty(course.ImageUrl))
            {
                existingCourse.ImageUrl = course.ImageUrl;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}