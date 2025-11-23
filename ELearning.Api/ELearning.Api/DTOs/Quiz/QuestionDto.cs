using System.Collections.Generic;

namespace ELearning.Api.DTOs.Quiz
{
    public class QuestionDto
    {
        public int QuestionId { get; set; }
        public string Text { get; set; }
        public string QuestionType { get; set; }

        public string CourseTitle { get; set; }
        public string SectionTitle { get; set; }

        public ICollection<AnswerOptionDto> Options { get; set; } = new List<AnswerOptionDto>();
    }
}