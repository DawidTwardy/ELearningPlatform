using System;

namespace ELearning.Api.DTOs.Reviews
{
    public class CreateReviewDto
    {
        public int CourseId { get; set; }
        public int Rating { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class ReviewDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public int Rating { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}