using ELearning.Api.Models.CourseContent;
using System;

namespace ELearning.Api.Models
{
    public class CommentReport
    {
        public int Id { get; set; }
        public int CommentId { get; set; }
        public string ReporterId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Comment Comment { get; set; }
        public ApplicationUser Reporter { get; set; }
    }
}