using ELearning.Api.DTOs.Reports;
using ELearning.Api.Models;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ELearing.Api.Controllers
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
        public async Task<IActionResult> ReportCourse([FromBody] SubmitCourseReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var report = new CourseReport
            {
                CourseId = dto.CourseId,
                ReporterId = userId,
                Reason = dto.Reason,
                ReportedAt = DateTime.UtcNow
            };

            _context.CourseReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg這szenie kursu zosta這 przyj皻e do weryfikacji." });
        }

        [HttpPost("Comment")]
        public async Task<IActionResult> ReportComment([FromBody] SubmitCommentReportDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var report = new CommentReport
            {
                CommentId = dto.CommentId,
                ReporterId = userId,
                Reason = dto.Reason,
                ReportedAt = DateTime.UtcNow
            };

            _context.CommentReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Zg這szenie komentarza zosta這 przyj皻e do weryfikacji." });
        }
    }
}