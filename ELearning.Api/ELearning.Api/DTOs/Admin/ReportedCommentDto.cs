using System;

namespace ELearning.Api.DTOs.Admin
{
    public class ReportedCommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string Author { get; set; }
        public string CourseTitle { get; set; }
        public int ReportCount { get; set; }
        public DateTime LastReported { get; set; }
    }
}