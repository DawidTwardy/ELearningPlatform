using ELearning.Api.Interfaces;
using ELearning.Api.Models;
using ELearning.Api.Models.Gamification;
using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ELearning.Api.Services
{
    public class GamificationService : IGamificationService
    {
        private readonly ApplicationDbContext _context;

        public GamificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task UpdateStreakAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var today = DateTime.UtcNow.Date;

            // Jeœli aktywnoœæ by³a dzisiaj, nic nie zmieniamy
            if (user.LastActivityDate.HasValue && user.LastActivityDate.Value.Date == today)
            {
                return;
            }

            // Jeœli aktywnoœæ by³a wczoraj, zwiêkszamy streak
            if (user.LastActivityDate.HasValue && user.LastActivityDate.Value.Date == today.AddDays(-1))
            {
                user.CurrentStreak++;
            }
            else
            {
                // W przeciwnym razie resetujemy do 1
                user.CurrentStreak = 1;
            }

            user.LastActivityDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await CheckBadgesAsync(userId);
        }

        public async Task AddPointsAsync(string userId, int points)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            user.Points += points;
            await _context.SaveChangesAsync();

            // Sprawdzamy odznaki po dodaniu punktów (np. za osi¹gniêcie 1000 pkt)
            await CheckBadgesAsync(userId);
        }

        public async Task CheckBadgesAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.UserBadges)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return;

            var allBadges = await _context.Badges.ToListAsync();
            var existingBadgeIds = user.UserBadges.Select(ub => ub.BadgeId).ToList();

            // Pobieramy statystyki u¿ytkownika
            int completedLessons = await _context.LessonCompletions.CountAsync(lc => lc.UserId == userId);
            int passedQuizzes = await _context.UserQuizAttempts.CountAsync(qa => qa.UserId == userId && qa.IsPassed);

            foreach (var badge in allBadges)
            {
                if (existingBadgeIds.Contains(badge.Id)) continue;

                bool awarded = false;

                switch (badge.CriteriaType)
                {
                    case "LessonCount":
                        if (completedLessons >= badge.CriteriaThreshold) awarded = true;
                        break;
                    case "QuizCount":
                        if (passedQuizzes >= badge.CriteriaThreshold) awarded = true;
                        break;
                    case "Streak":
                        if (user.CurrentStreak >= badge.CriteriaThreshold) awarded = true;
                        break;
                    case "Points": // NOWE: Odznaki za punkty
                        if (user.Points >= badge.CriteriaThreshold) awarded = true;
                        break;
                }

                if (awarded)
                {
                    _context.UserBadges.Add(new UserBadge { UserId = userId, BadgeId = badge.Id });
                    _context.Notifications.Add(new Notification
                    {
                        UserId = userId,
                        Message = $"Gratulacje! Zdoby³eœ now¹ odznakê: {badge.Name}",
                        Type = "success" // U¿ywane przez frontend do wyœwietlenia ikony ??
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}