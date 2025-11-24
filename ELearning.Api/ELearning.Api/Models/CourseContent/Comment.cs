using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models.CourseContent
{
    public class Comment
    {
        public int Id { get; set; }

        public string Content { get; set; } = string.Empty;
        public DateTime Created { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        public int CourseId { get; set; }
        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        public int? ParentCommentId { get; set; }
        [ForeignKey("ParentCommentId")]
        public Comment? ParentComment { get; set; }

        public List<Comment> Replies { get; set; } = new List<Comment>();
    }
}