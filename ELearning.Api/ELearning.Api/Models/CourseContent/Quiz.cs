namespace ELearning.Api.Models.CourseContent
{
    public class Quiz
    {
        public int Id { get; set; }
        public int SectionId { get; set; } 
        public string Title { get; set; } = "Test z Sekcji";

       
        public string QuizDataJson { get; set; } = "[]";

      
        public CourseSection Section { get; set; }
    }
}