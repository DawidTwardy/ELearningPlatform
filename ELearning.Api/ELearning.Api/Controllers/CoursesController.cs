using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ELearning.Api.Models.CourseContent;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Sections)
                .ToListAsync();

            if (courses == null)
            {
                return NotFound();
            }

            return Ok(courses);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Course>> GetCourse(int? id)
        {
            if (!id.HasValue)
            {
                return BadRequest("Brak identyfikatora kursu.");
            }

            var course = await _context.Courses
                .AsSplitQuery()
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Quiz)
                        .ThenInclude(q => q.Questions)
                            .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(c => c.Id == id.Value);

            if (course == null)
            {
                return NotFound();
            }

            return Ok(course);
        }

        // NOWY ENDPOINT: USUWANIE WSZYSTKICH KURSÓW I POWIĄZANYCH DANYCH
        [HttpDelete("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAllCourses()
        {
            // Usunięcie danych powiązanych
            _context.UserAnswers.RemoveRange(_context.UserAnswers);
            _context.UserQuizAttempts.RemoveRange(_context.UserQuizAttempts);
            _context.LessonCompletions.RemoveRange(_context.LessonCompletions);
            _context.Enrollments.RemoveRange(_context.Enrollments);
            _context.AnswerOptions.RemoveRange(_context.AnswerOptions);
            _context.Questions.RemoveRange(_context.Questions);
            _context.Quizzes.RemoveRange(_context.Quizzes);
            _context.Lessons.RemoveRange(_context.Lessons);
            _context.CourseSections.RemoveRange(_context.CourseSections);

            // Usunięcie kursów
            _context.Courses.RemoveRange(_context.Courses);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<ActionResult<Course>> CreateCourse([FromBody] Course course)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                course.InstructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                course.Instructor = User.Identity!.Name ?? "Nieznany Instruktor";

                _context.Courses.Add(course);

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n==================== BŁĄD ZAPISU KURSU (500) ====================");
                Console.WriteLine($"PEŁNY WYJĄTEK: {ex.ToString()}");
                Console.WriteLine($"=================================================================\n");

                return StatusCode(500, new { Message = "Wewnętrzny błąd serwera podczas zapisu kursu. Sprawdź logi serwera.", Details = ex.Message, InnerDetails = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] Course course)
        {
            if (id != course.Id)
            {
                return BadRequest();
            }

            var existingCourse = await _context.Courses
                .Include(c => c.Sections)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingCourse == null)
            {
                return NotFound();
            }

            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.ImageSrc = course.ImageSrc;
            existingCourse.Instructor = course.Instructor;
            existingCourse.Rating = course.Rating;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Courses.Any(e => e.Id == id))
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}