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
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // --- DODANO: Metoda do tworzenia powiadomieñ ---
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
        {
            if (notification == null) return BadRequest();

            // Ustawiamy domyœlne wartoœci
            notification.CreatedAt = DateTime.UtcNow;
            notification.IsRead = false;

            // Jeœli userId nie zosta³ podany, zwracamy b³¹d (dla zg³oszeñ b³êdów userId to instruktor)
            if (string.IsNullOrEmpty(notification.UserId))
            {
                return BadRequest(new { message = "Odbiorca (UserId) jest wymagany." });
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(notification);
        }
        // -----------------------------------------------

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null) return NotFound();
            if (notification.UserId != userId) return Forbid();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}