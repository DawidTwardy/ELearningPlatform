using ELearning.Api.Models;
using ELearning.Api.Persistence;
using ELearning.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PushController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PushNotificationService _pushService;

        public PushController(ApplicationDbContext context, IConfiguration configuration, PushNotificationService pushService)
        {
            _context = context;
            _configuration = configuration;
            _pushService = pushService;
        }

        [HttpGet("public-key")]
        public IActionResult GetPublicKey()
        {
            return Ok(new { publicKey = _configuration["VapidSettings:PublicKey"] });
        }

        [HttpPost("subscribe")]
        [Authorize]
        public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existing = await _context.PushSubscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == dto.Endpoint);

            if (existing == null)
            {
                var sub = new Models.PushSubscription
                {
                    UserId = userId,
                    Endpoint = dto.Endpoint,
                    P256dh = dto.Keys.P256dh,
                    Auth = dto.Keys.Auth
                };
                _context.PushSubscriptions.Add(sub);
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpPost("broadcast")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> Broadcast([FromBody] NotificationPayloadDto payload)
        {
            await _pushService.SendNotificationToAllAsync(payload.Title, payload.Message, payload.Url);
            return Ok();
        }
    }

    public class PushSubscriptionDto
    {
        public string Endpoint { get; set; }
        public KeysDto Keys { get; set; }
    }

    public class KeysDto
    {
        public string P256dh { get; set; }
        public string Auth { get; set; }
    }

    public class NotificationPayloadDto
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public string Url { get; set; }
    }
}