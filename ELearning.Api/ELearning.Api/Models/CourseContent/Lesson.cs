namespace ELearning.Api.Models.CourseContent
{
    public class Lesson
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Order { get; set; }
        public string Type { get; set; } = "video";
        public string Content { get; set; } = string.Empty;


        public CourseSection? Section { get; set; }
    }
}