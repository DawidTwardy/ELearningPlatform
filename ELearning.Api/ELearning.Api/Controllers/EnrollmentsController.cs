using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace ELearning.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{courseId}")]
        public async Task<IActionResult> Enroll(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Nie mo¿na zidentyfikowaæ u¿ytkownika." });
            }

            var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);
            if (!courseExists)
            {
                return NotFound(new { Message = "Kurs o podanym ID nie istnieje." });
            }

            var alreadyEnrolled = await _context.Set<Enrollment>()
                .AnyAsync(e => e.CourseId == courseId && e.ApplicationUserId == userId);

            if (alreadyEnrolled)
            {
                return Conflict(new { Message = "U¿ytkownik jest ju¿ zapisany na ten kurs." });
            }

            var enrollment = new Enrollment
            {
                CourseId = courseId,
                ApplicationUserId = userId,
                EnrollmentDate = DateTime.Now
            };

            _context.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Pomyœlnie zapisano na kurs." });
        }

        [HttpGet]
        public async Task<ActionResult> GetMyCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Nie mo¿na zidentyfikowaæ u¿ytkownika." });
            }

            // OSTATECZNA POPRAWKA DLA B£ÊDU 500: Projekcja na typ anonimowy. 
            // Tworzy czysty obiekt (DTO) bez proxy i usuwa b³êdy materializacji/serializacji EF.
            var myCourses = await _context.Set<Enrollment>()
                .Where(e => e.ApplicationUserId == userId)
                .Select(e => new
                {
                    Id = e.Course.Id,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    ImageSrc = e.Course.ImageSrc,
                    Instructor = e.Course.Instructor,
                    Rating = e.Course.Rating,
                    // Dodajemy puste Sections, aby frontend go nie pomija³
                    Sections = new List<object>()
                })
                .ToListAsync();

            return Ok(myCourses);
        }
    }
}