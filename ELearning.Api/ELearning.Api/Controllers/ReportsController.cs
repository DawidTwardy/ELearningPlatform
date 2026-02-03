using ELearning.Api.DTOs.Reports;
using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("Course")]
        public async Task<IActionResult> ReportCourse([FromBody] SubmitReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var course = await _context.Courses.FindAsync(dto.CourseId);
            if (course == null) return NotFound("Kurs nie istnieje.");

            var existingReport = await _context.CourseReports
                .FirstOrDefaultAsync(r => r.CourseId == dto.CourseId && r.ReportedById == userId);

            if (existingReport != null)
            {
                return BadRequest("Ju¿ zg³osi³eœ ten kurs.");
            }

            var report = new CourseReport
            {
                CourseId = dto.CourseId,
                ReportedById = userId,
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow,
                Status = "New"
            };

            _context.CourseReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenie zosta³o wys³ane do administratora." });
        }

        [HttpPost("Comment")]
        public async Task<IActionResult> ReportComment([FromBody] SubmitReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!dto.CommentId.HasValue) return BadRequest("Brak ID komentarza.");

            var comment = await _context.Comments.FindAsync(dto.CommentId);
            if (comment == null) return NotFound("Komentarz nie istnieje.");

            var report = new CommentReport
            {
                CommentId = dto.CommentId.Value,
                ReportedById = userId,
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            _context.CommentReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenie komentarza zosta³o wys³ane." });
        }

        [HttpDelete("{reportId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport(int reportId)
        {
            var report = await _context.CourseReports.FindAsync(reportId);
            if (report == null) return NotFound();

            _context.CourseReports.Remove(report);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}