using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ELearning.Api.Models.CourseContent
{
    public class LessonResource
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string FileUrl { get; set; } = string.Empty;

       
        public int LessonId { get; set; }

        
        [JsonIgnore]
        public virtual Lesson? Lesson { get; set; }
    }
}