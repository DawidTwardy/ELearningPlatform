using System.Collections.Generic;

namespace ELearning.Api.Models.CourseContent
{
    public class Quiz
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public string Title { get; set; } = "Test z Sekcji";

        public CourseSection? Section { get; set; }
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}