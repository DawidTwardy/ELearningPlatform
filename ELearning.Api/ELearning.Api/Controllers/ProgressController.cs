using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using ELearning.Api.Models;
using System.Linq;

namespace ELearning.Api.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class ProgressController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public ProgressController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpPost("lesson/{lessonId}/complete")]
		public async Task<IActionResult> MarkLessonCompleted(int lessonId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var lessonExists = await _context.Lessons.AnyAsync(l => l.Id == lessonId);
			if (!lessonExists)
			{
				return NotFound(new { Message = "Lekcja o podanym ID nie istnieje." });
			}

			var alreadyCompleted = await _context.Set<LessonCompletion>()
				.AnyAsync(lc => lc.LessonId == lessonId && lc.ApplicationUserId == userId);

			if (alreadyCompleted)
			{
				return Ok(new { Message = "Lekcja zosta³a ju¿ ukoñczona.", Status = "completed" });
			}

			var completion = new LessonCompletion
			{
				ApplicationUserId = userId,
				LessonId = lessonId,
				CompletedDate = DateTime.Now
			};

			_context.Add(completion);
			await _context.SaveChangesAsync();

			return Ok(new { Message = "Pomyœlnie oznaczono lekcjê jako ukoñczon¹.", Status = "newly_completed" });
		}

		[HttpGet("course/{courseId}")]
		public async Task<ActionResult<object>> GetCourseProgress(int courseId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var course = await _context.Courses
				.Include(c => c.Sections)
				.ThenInclude(s => s.Lessons)
				.FirstOrDefaultAsync(c => c.Id == courseId);

			if (course == null)
			{
				return NotFound();
			}

			var allLessonIdsInCourse = course.Sections
				.SelectMany(s => s.Lessons)
				.Select(l => l.Id)
				.ToList();

			var completedLessons = await _context.Set<LessonCompletion>()
				.Where(lc => lc.ApplicationUserId == userId && allLessonIdsInCourse.Contains(lc.LessonId))
				.Select(lc => lc.LessonId)
				.ToListAsync();

			var totalLessons = allLessonIdsInCourse.Count;
			var completedCount = completedLessons.Count;
			var progressPercentage = totalLessons > 0 ? (int)Math.Round((double)completedCount / totalLessons * 100) : 0;


			return Ok(new
			{
				CourseId = courseId,
				TotalLessons = totalLessons,
				CompletedLessonsCount = completedCount,
				ProgressPercentage = progressPercentage,
				CompletedLessonIds = completedLessons
			});
		}
	}
}