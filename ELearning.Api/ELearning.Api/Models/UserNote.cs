using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ELearning.Api.Models.CourseContent;

namespace ELearning.Api.Models
{
    public class UserNote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        [Required]
        public int LessonId { get; set; }

        [ForeignKey("LessonId")]
        public Lesson Lesson { get; set; }

        public string Content { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}