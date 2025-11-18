using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models
{
    public class Enrollment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } // To pole jest kluczowe!

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        [Required]
        public int CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course Course { get; set; }

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        public int Progress { get; set; } = 0; // To pole te¿ musi byæ

        public bool IsCompleted { get; set; } = false; // I to
    }
}