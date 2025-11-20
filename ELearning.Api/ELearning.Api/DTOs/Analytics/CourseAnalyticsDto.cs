using System;
using System.Collections.Generic;

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
    }

    public class EnrollmentDataPoint
    {
        public string Date { get; set; }
        public int Count { get; set; }
    }
}