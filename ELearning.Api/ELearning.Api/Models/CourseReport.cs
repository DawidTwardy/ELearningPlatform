using System;
using ELearning.Api.Models;

namespace ELearning.Api.Models
{
    public class CourseReport
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string ReporterId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Course Course { get; set; }
        public ApplicationUser Reporter { get; set; }
    }
}