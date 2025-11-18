using System.Collections.Generic;

// Upewnij siê, ¿e ten namespace jest POPRAWNY
namespace ELearning.Api.DTOs.Quiz
{
    public class SubmitQuizDto
    {
        public int QuizId { get; set; }
        public ICollection<SubmittedAnswerDto> Answers { get; set; } = new List<SubmittedAnswerDto>();
    }
}