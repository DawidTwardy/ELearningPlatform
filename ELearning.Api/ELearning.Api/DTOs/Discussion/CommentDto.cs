using System;
using System.Collections.Generic;

namespace ELearning.Api.DTOs.Discussion
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Author { get; set; }
        public string Avatar { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>();
    }

    public class CreateCommentDto
    {
        public int CourseId { get; set; }
        public string Content { get; set; }
        public int? ParentCommentId { get; set; }
    }

    public class UpdateCommentDto
    {
        public string Content { get; set; }
    }
}