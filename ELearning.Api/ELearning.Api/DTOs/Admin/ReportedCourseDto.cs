using System;

namespace ELearning.Api.DTOs.Admin
{
    public class ReportedCourseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Instructor { get; set; }
        public double Rating { get; set; }
        public string ImageSrc { get; set; }
        public int ReportCount { get; set; }
        public DateTime LastReported { get; set; }
    }
}