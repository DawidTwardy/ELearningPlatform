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
            // Płytkie ładowanie kursów (tylko sekcje), aby uniknąć przeciążania widoku listy.
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
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            // Głębokie ładowanie całego grafu obiektu (Eager Loading)
            // To jest krytyczne dla wyświetlania sekcji i quizów na frontendzie.
            var course = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons) // Ładuje lekcje w sekcjach
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Quiz) // Ładuje quiz w sekcji
                        .ThenInclude(q => q.Questions) // Ładuje pytania w quizie
                            .ThenInclude(qs => qs.Options) // Ładuje opcje w pytaniu
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            return Ok(course);
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
                // 1. Przypisanie Instruktora z tokena
                course.InstructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                course.Instructor = User.Identity!.Name ?? "Nieznany Instruktor";

                // 2. Dodanie całego grafu obiektów (Course + Sections + Lessons + Quizzes + Questions + Options)
                _context.Courses.Add(course);

                // 3. JEDNOKROTNY, ATOMOWY ZAPIS DO BAZY DANYCH
                await _context.SaveChangesAsync();

                // Zwracamy stworzony obiekt z nowymi Id
                return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
            }
            catch (Exception ex)
            {
                // Logowanie pełnego wyjątku do diagnozy błędu 500
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