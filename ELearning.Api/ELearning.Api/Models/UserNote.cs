using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models
{
    public class UserNote
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        public int LessonId { get; set; }

        public string Content { get; set; }

        public string Title { get; set; } = "Moje Notatki";

        public DateTime LastUpdated { get; set; }
    }
}