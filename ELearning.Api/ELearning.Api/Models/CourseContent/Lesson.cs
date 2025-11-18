using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models.CourseContent
{
    public class Lesson
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string VideoUrl { get; set; } = string.Empty;

        public int SectionId { get; set; }

        [ForeignKey("SectionId")]
        public CourseSection Section { get; set; }
    }
}