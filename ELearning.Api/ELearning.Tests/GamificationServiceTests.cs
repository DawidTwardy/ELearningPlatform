using ELearning.Api.Models;
using ELearning.Api.Models.Gamification;
using ELearning.Api.Services;
using ELearning.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace ELearning.Tests.Services
{
    public class GamificationServiceTests
    {
        [Fact]
        public async Task CheckBadgesAsync_ShouldAwardStreakBadge_WhenCriteriaMet()
        {
            using var context = TestDatabaseHelper.GetDatabaseContext();
            var userId = "test-user-success";

            context.Users.Add(new ApplicationUser { Id = userId, UserName = "student1", CurrentStreak = 7 });
            context.Badges.Add(new Badge
            {
                Id = 1,
                Name = "Siedmiodniówka",
                CriteriaType = "Streak",
                CriteriaThreshold = 7,
                Description = "Nagroda za 7 dni nauki",
                IconUrl = "/icons/streak7.png"
            });
            await context.SaveChangesAsync();

            var service = new GamificationService(context);
            await service.CheckBadgesAsync(userId);

            var result = await context.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == 1);
            Assert.True(result);
        }

        [Fact]
        public async Task UpdateStreakAsync_ShouldIncrementStreak_WhenLastActivityWasYesterday()
        {
            using var context = TestDatabaseHelper.GetDatabaseContext();
            var userId = "streak-user";
            context.Users.Add(new ApplicationUser
            {
                Id = userId,
                CurrentStreak = 5,
                LastActivityDate = DateTime.UtcNow.AddDays(-1)
            });
            await context.SaveChangesAsync();
            var service = new GamificationService(context);

            await service.UpdateStreakAsync(userId);

            var user = await context.Users.FindAsync(userId);
            Assert.Equal(6, user.CurrentStreak);
        }
    }
}