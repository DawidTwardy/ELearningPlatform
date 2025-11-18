using ELearning.Api.Persistence;
using ELearning.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CertificateService _certificateService;

        public CertificatesController(ApplicationDbContext context, CertificateService certificateService)
        {
            _context = context;
            _certificateService = certificateService;
        }

        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetCertificate(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (enrollment == null)
            {
                return NotFound("Nie znaleziono zapisu na ten kurs.");
            }

            if (!enrollment.IsCompleted)
            {
                return BadRequest("Kurs nie zosta³ jeszcze ukoñczony.");
            }

            var studentName = $"{enrollment.User.FirstName} {enrollment.User.LastName}";
            if (string.IsNullOrWhiteSpace(studentName)) studentName = enrollment.User.UserName;

            var courseTitle = enrollment.Course.Title;
            var instructorName = enrollment.Course.Instructor != null
                ? enrollment.Course.Instructor.UserName
                : "Zespó³ ELearning";

            var pdfBytes = _certificateService.GenerateCertificate(studentName, courseTitle, instructorName, DateTime.UtcNow);

            return File(pdfBytes, "application/pdf", $"Certyfikat_{courseTitle}_{userId}.pdf");
        }
    }
}