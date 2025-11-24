using System;
using System.Collections.Generic;

namespace ELearning.Api.DTOs.Discussion
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string UserName { get; set; }
        public string? AvatarUrl { get; set; } // Dodane pole dla awatara
        public DateTime Created { get; set; }
        public int? ParentCommentId { get; set; }
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>();
    }
}