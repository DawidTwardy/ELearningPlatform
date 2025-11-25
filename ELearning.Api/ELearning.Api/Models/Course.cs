using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ELearning.Api.Models.CourseContent;

namespace ELearning.Api.Models
{
    public class Course
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } = 0.00m;

        public string Category { get; set; } = "Ogólny";

        public string Level { get; set; } = "Początkujący";

        public string ImageUrl { get; set; } = "/src/course/placeholder_ai.png";

        public double Rating { get; set; } = 0.0;

        public int RatingCount { get; set; } = 0;

        public string? InstructorId { get; set; }

        [ForeignKey("InstructorId")]
        public ApplicationUser? Instructor { get; set; }

        public ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<CourseReview> Reviews { get; set; } = new List<CourseReview>();

       
        public ICollection<CourseReport> Reports { get; set; } = new List<CourseReport>();
        
    }
}