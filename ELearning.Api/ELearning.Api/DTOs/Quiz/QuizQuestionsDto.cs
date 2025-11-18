using System.Collections.Generic;

namespace ELearning.Api.DTOs.Quiz
{
    public class QuizQuestionsDto
    {
        public int QuizId { get; set; }
        public string Title { get; set; }
        public int SectionId { get; set; }
        public ICollection<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }
}