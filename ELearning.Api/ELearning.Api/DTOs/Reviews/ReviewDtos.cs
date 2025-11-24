using System;

namespace ELearning.Api.DTOs.Reviews
{
    public class CreateReviewDto
    {
        public int CourseId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }

    public class ReviewDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string? AvatarUrl { get; set; } 
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}