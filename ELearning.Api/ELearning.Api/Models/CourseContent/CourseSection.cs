namespace ELearning.Api.Models.CourseContent
{
    public class CourseSection
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Order { get; set; }


        public Course? Course { get; set; }
        public List<Lesson> Lessons { get; set; } = new List<Lesson>();
        public Quiz? Quiz { get; set; }
    }
}