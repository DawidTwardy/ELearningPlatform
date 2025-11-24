namespace ELearning.Api.DTOs.Analytics
{
    public class CourseAnalyticsDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalStudents { get; set; }
        public double AverageQuizScore { get; set; }
        public double CompletionRate { get; set; }
        public List<EnrollmentDataPoint> EnrollmentGrowth { get; set; }
        public List<CourseReportDto> Reports { get; set; } = new List<CourseReportDto>();
    }

    public class EnrollmentDataPoint
    {
        public string Date { get; set; }
        public int Count { get; set; }
    }

    public class CourseReportDto
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}