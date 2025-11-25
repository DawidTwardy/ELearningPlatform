using ELearning.Api.Interfaces;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IGamificationService _gamificationService;

        public GamificationController(ApplicationDbContext context, IGamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;
        }

        [HttpGet("my-stats")]
        [Authorize]
        public async Task<IActionResult> GetMyStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // WYMUSZENIE SPRAWDZENIA ODZNAK PRZED POBRANIEM DANYCH
            // Dziêki temu, jeœli u¿ytkownik ma punkty, ale odznaka nie "wskoczy³a", teraz zostanie dodana.
            await _gamificationService.CheckBadgesAsync(userId);

            var user = await _context.Users
                .Include(u => u.UserBadges)
                .ThenInclude(ub => ub.Badge)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            var result = new
            {
                points = user.Points,
                currentStreak = user.CurrentStreak,
                badges = user.UserBadges.Select(ub => new
                {
                    id = ub.Badge.Id,
                    name = ub.Badge.Name,
                    description = ub.Badge.Description,
                    iconUrl = ub.Badge.IconUrl,
                    awardedAt = ub.AwardedAt
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("leaderboard")]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 1. Pobierz TOP 10 u¿ytkowników
            var topUsersEntities = await _context.Users
                .OrderByDescending(u => u.Points)
                .ThenBy(u => u.UserName) // Dodatkowe sortowanie dla stabilnoœci
                .Take(10)
                .ToListAsync();

            // 2. Zmapuj na DTO i nadaj rangi 1-10
            var leaderboard = topUsersEntities.Select((u, index) => new LeaderboardEntryDto
            {
                Rank = index + 1,
                UserName = u.UserName,
                Points = u.Points,
                CurrentStreak = u.CurrentStreak,
                IsCurrentUser = u.Id == currentUserId
            }).ToList();

            // 3. Jeœli u¿ytkownik jest zalogowany i nie ma go w TOP 10
            if (!string.IsNullOrEmpty(currentUserId) && !leaderboard.Any(x => x.IsCurrentUser))
            {
                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser != null)
                {
                    // Oblicz pozycjê u¿ytkownika: liczba osób, które maj¹ wiêcej punktów + 1
                    var rank = await _context.Users.CountAsync(u => u.Points > currentUser.Points) + 1;

                    leaderboard.Add(new LeaderboardEntryDto
                    {
                        Rank = rank,
                        UserName = currentUser.UserName,
                        Points = currentUser.Points,
                        CurrentStreak = currentUser.CurrentStreak,
                        IsCurrentUser = true
                    });
                }
            }

            return Ok(leaderboard);
        }
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string UserName { get; set; }
        public int Points { get; set; }
        public int CurrentStreak { get; set; }
        public bool IsCurrentUser { get; set; }
    }
}