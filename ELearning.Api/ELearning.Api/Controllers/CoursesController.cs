// Plik: ELearningPlatform-main/ELearning.Api/ELearning.Api/Controllers/CoursesController.cs

using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ELearning.Api.Models.CourseContent;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

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

        // GET: api/Courses (Publiczne)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                .Include(c => c.Sections)
                .ThenInclude(s => s.Quiz)
                .ToListAsync();

            if (courses == null)
            {
                return NotFound();
            }

            return Ok(courses);
        }

        // GET: api/Courses/5 (Publiczne)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                .Include(c => c.Sections)
                .ThenInclude(s => s.Quiz)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            return Ok(course);
        }

        // POST: api/Courses (Wymaga autoryzacji)
        [HttpPost]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<ActionResult<Course>> CreateCourse([FromBody] Course course)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sections = course.Sections;
            course.Sections = null;

            course.Instructor = User.Identity.Name ?? "Nieznany Instruktor";
            course.Id = 0; // Upewnij się, że Id jest zerowane przed zapisem głównego obiektu

            _context.Courses.Add(course);

            try
            {
                // 1. Zapisz główny kurs
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Błąd zapisu głównego kursu w bazie danych.", Details = ex.Message });
            }

            // 2. Dodaj sekcje, lekcje i quizy, zerując ich ID i przypisując klucze
            if (sections != null && sections.Any())
            {
                foreach (var section in sections)
                {
                    section.Id = 0; // KOREKTA: Zerowanie ID sekcji
                    section.CourseId = course.Id;

                    if (section.Lessons != null)
                    {
                        foreach (var lesson in section.Lessons)
                        {
                            lesson.Id = 0; // KOREKTA: Zerowanie ID lekcji
                            _context.Entry(lesson).State = EntityState.Added;
                        }
                    }

                    if (section.Quiz != null)
                    {
                        section.Quiz.Id = 0; // KOREKTA: Zerowanie ID quizu
                        _context.Entry(section.Quiz).State = EntityState.Added;
                    }

                    _context.CourseSections.Add(section);
                }

                try
                {
                    // 3. Zapisz zagnieżdżone elementy
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { Message = "Błąd zapisu sekcji/lekcji do bazy danych.", Details = ex.Message });
                }
            }

            course.Sections = sections;

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        // PUT: api/Courses/5 (Wymaga autoryzacji)
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

        // DELETE: api/Courses/5 (Wymaga autoryzacji: tylko Admin)
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