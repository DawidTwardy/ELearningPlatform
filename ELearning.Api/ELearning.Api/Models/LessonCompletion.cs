using System;

namespace ELearning.Api.Models
{
	public class LessonCompletion
	{
		public int Id { get; set; }

		public string ApplicationUserId { get; set; } = null!;
		public ApplicationUser ApplicationUser { get; set; } = null!;

		public int LessonId { get; set; }
		public CourseContent.Lesson Lesson { get; set; } = null!;

		public DateTime CompletedDate { get; set; }
	}
}