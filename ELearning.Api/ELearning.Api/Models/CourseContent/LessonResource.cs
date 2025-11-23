using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models.CourseContent
{
    public class LessonResource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // Np. "Kod Ÿród³owy", "Prezentacja"

        [Required]
        public string FileUrl { get; set; } = string.Empty; // Link do pliku

        public int LessonId { get; set; }

        [ForeignKey("LessonId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Lesson Lesson { get; set; }
    }
}