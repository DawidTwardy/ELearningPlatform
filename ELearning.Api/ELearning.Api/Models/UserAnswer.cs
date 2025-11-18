namespace ELearning.Api.Models.CourseContent
{
    public class UserAnswer
    {
        public int Id { get; set; }
        public int AttemptId { get; set; }
        public int QuestionId { get; set; }
        public int AnswerOptionId { get; set; } // Wybrana opcja przez uøytkownika
        public bool IsCorrect { get; set; } // Czy wybrana odpowiedü by≥a poprawna (obliczone w momencie zapisu)

        // Relacje
        public UserQuizAttempt? Attempt { get; set; }
        public Question? Question { get; set; }
        public AnswerOption? AnswerOption { get; set; }
    }
}