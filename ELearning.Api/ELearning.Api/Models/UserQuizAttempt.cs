using ELearning.Api.Models;

namespace ELearning.Api.Models.CourseContent
{
    public class UserQuizAttempt
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string UserId { get; set; }
        public DateTime AttemptDate { get; set; } = DateTime.UtcNow;
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool IsPassed { get; set; }

        // Relacje
        public Quiz? Quiz { get; set; }
        public ApplicationUser? User { get; set; }
        public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    }
}