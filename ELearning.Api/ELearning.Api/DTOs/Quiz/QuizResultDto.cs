namespace ELearning.Api.DTOs.Quiz
{
    public class QuizResultDto
    {
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool IsPassed { get; set; }
        public int AttemptsCount { get; set; }
    }
}