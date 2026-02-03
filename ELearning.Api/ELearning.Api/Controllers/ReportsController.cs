using ELearning.Api.DTOs.Reports;
using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

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

        // Klasa DTO definowana lokalnie lub w osobnym pliku, 
        // tutaj dla pewnoœci, ¿e zostanie u¿yta poprawna struktura JSON.
        public class ReportDto
        {
            public int Id { get; set; }
            public string Reason { get; set; }
            public DateTime ReportedAt { get; set; }
            public string Status { get; set; }
            public string ReporterName { get; set; }
        }

        [HttpPost("Course")]
        public async Task<IActionResult> ReportCourse([FromBody] SubmitCourseReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var report = new CourseReport
            {
                CourseId = dto.CourseId,
                Reason = dto.Reason,
                ReporterId = userId,
                ReportedAt = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.CourseReports.Add(report);

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId);
            if (course != null && !string.IsNullOrEmpty(course.InstructorId))
            {
                var notification = new Notification
                {
                    UserId = course.InstructorId,
                    Message = $"Nowe zg³oszenie w kursie '{course.Title}': {dto.Reason}",
                    Type = "Report",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    RelatedEntityId = course.Id
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Zg³oszenie zosta³o wys³ane." });
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<ReportDto>>> GetCourseReports(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null) return NotFound("Kurs nie istnieje.");

            if (course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var reports = await _context.CourseReports
                .Where(r => r.CourseId == courseId)
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new ReportDto
                {
                    Id = r.Id,
                    Reason = r.Reason,
                    ReportedAt = r.ReportedAt,
                    Status = r.Status,
                    ReporterName = r.Reporter.UserName ?? "Anonim"
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var report = await _context.CourseReports.Include(r => r.Course).FirstOrDefaultAsync(r => r.Id == id);

            if (report == null) return NotFound();

            if (report.Course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _context.CourseReports.Remove(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenie usuniête." });
        }

        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> ResolveReport(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var report = await _context.CourseReports.Include(r => r.Course).FirstOrDefaultAsync(r => r.Id == id);

            if (report == null) return NotFound();

            if (report.Course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            report.Status = "Resolved";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenie oznaczone jako rozwi¹zane." });
        }

        [HttpPost("Comment")]
        public async Task<IActionResult> ReportComment([FromBody] SubmitCommentReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var report = new CommentReport
            {
                CommentId = dto.CommentId,
                Reason = dto.Reason,
                ReporterId = userId,
                ReportedAt = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.CommentReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg³oszenie komentarza zosta³o wys³ane." });
        }
    }
}