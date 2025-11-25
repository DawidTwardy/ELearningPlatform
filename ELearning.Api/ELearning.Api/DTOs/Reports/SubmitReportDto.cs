namespace ELearning.Api.DTOs.Reports
{
    public class SubmitCourseReportDto
    {
        public int CourseId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class SubmitCommentReportDto
    {
        public int CommentId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}