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
        public async Task<ActionResult<IEnumerable<Course>>> GetMyCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Nie mo¿na zidentyfikowaæ u¿ytkownika." });
            }

            var myCourses = await _context.Set<Enrollment>()
                .Where(e => e.ApplicationUserId == userId)
                // KROK 1: £ADUJEMY RELACJE ZACZYNAJ¥C OD W£AŒCIWOŒCI Course w Enrollment
                .Include(e => e.Course)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)
                // KROK 2: ZACZYNAMY NOWY £AÑCUCH Z TEGO SAMEGO ROOT Enrollment
                .Include(e => e.Course)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Quiz)
                // KROK 3: PROJEKCJA NA KOÑCU: ZWRACAMY TYLKO OBIEKT Course
                .Select(e => e.Course)
                .AsSplitQuery()
                .ToListAsync();

            return Ok(myCourses);
        }
    }
}