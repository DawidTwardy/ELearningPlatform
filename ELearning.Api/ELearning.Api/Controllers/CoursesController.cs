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
            // USUNIĘTO: Głębokie Include, aby uniknąć błędów serializacji JSON (błąd 500)
            var courses = await _context.Courses
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
            // USUNIĘTO: Głębokie Include, aby uniknąć błędów serializacji JSON (błąd 500)
            // Lądujemy tylko podstawowy obiekt Course
            var course = await _context.Courses
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

            var sections = course.Sections ?? new List<CourseSection>();
            course.Sections = new List<CourseSection>();

            course.Instructor = User.Identity!.Name ?? "Nieznany Instruktor";

            _context.Courses.Add(course);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Błąd zapisu głównego kursu w bazie danych.", Details = ex.Message });
            }

            if (sections.Any())
            {
                foreach (var section in sections)
                {
                    section.CourseId = course.Id;

                    if (section.Lessons != null)
                    {
                        foreach (var lesson in section.Lessons)
                        {
                            lesson.SectionId = section.Id;
                        }
                    }
                    if (section.Quiz != null)
                    {
                        section.Quiz.SectionId = section.Id;
                        _context.Quizzes.Add(section.Quiz);
                    }

                    _context.CourseSections.Add(section);
                }

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { Message = "Błąd zapisu sekcji, lekcji lub quizów do bazy danych.", Details = ex.Message, InnerDetails = ex.InnerException?.Message });
                }
            }

            course.Sections = sections;

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
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