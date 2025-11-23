using System.Threading.Tasks;

namespace ELearning.Api.Interfaces
{
    public interface IGamificationService
    {
        Task UpdateStreakAsync(string userId);
        Task AddPointsAsync(string userId, int points);
        Task CheckBadgesAsync(string userId);
    }
}