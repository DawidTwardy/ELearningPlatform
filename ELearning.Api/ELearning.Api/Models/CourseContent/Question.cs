namespace ELearning.Api.Models.CourseContent
{
    public class Question
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string Text { get; set; }
        public string QuestionType { get; set; } = "SingleChoice";

        public Quiz? Quiz { get; set; }
        public ICollection<AnswerOption> Options { get; set; } = new List<AnswerOption>();
    }
}