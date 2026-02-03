using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models
{
    public class CourseReport
    {
        public int Id { get; set; }

        [Required]
        public int CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course Course { get; set; }

        [Required]
        public string ReporterId { get; set; }

        [ForeignKey("ReporterId")]
        public ApplicationUser Reporter { get; set; }

        [Required]
        public string Reason { get; set; }

        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending";
    }
}