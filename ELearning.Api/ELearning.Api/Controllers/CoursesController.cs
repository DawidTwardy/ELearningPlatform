using ELearning.Api.Models;
using ELearning.Api.Models.CourseContent;
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCourses([FromQuery] string? search)
        {
            var query = _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchLower = search.ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(searchLower) ||
                                         (c.Instructor != null && (
                                            c.Instructor.UserName.ToLower().Contains(searchLower) ||
                                            c.Instructor.FirstName.ToLower().Contains(searchLower) ||
                                            c.Instructor.LastName.ToLower().Contains(searchLower)
                                         )));
            }

            var courses = await query.ToListAsync();

            var result = courses.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Category,
                c.Level,
                c.Price,
                ImageSrc = c.ImageUrl,
                ImageUrl = c.ImageUrl,
                AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = c.Reviews.Count,
                StudentsCount = c.Enrollments.Count,
                // ZMIANA: Dodano AvatarUrl
                Instructor = c.Instructor != null ? new
                {
                    Name = c.Instructor.UserName,
                    AvatarUrl = c.Instructor.AvatarUrl,
                    Bio = "Instruktor"
                } : null
            });

            return Ok(result);
        }

        [HttpGet("my-courses")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetInstructorCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie rozpoznano użytkownika.");
            }

            var courses = await _context.Courses
                .Where(c => c.InstructorId == userId)
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .ToListAsync();

            var result = courses.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Category,
                c.Level,
                c.Price,
                ImageSrc = c.ImageUrl,
                ImageUrl = c.ImageUrl,
                AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = c.Reviews.Count,
                StudentsCount = c.Enrollments.Count,
                // ZMIANA: Dodano AvatarUrl
                Instructor = c.Instructor != null ? new
                {
                    Name = c.Instructor.UserName,
                    AvatarUrl = c.Instructor.AvatarUrl,
                    Bio = "Instruktor"
                } : null
            });

            return Ok(result);
        }

        // ... (reszta metod bez zmian, np. GetCourse, CreateCourse, UpdateCourse, DeleteCourse)
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                        .ThenInclude(l => l.Resources)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Quiz)
                        .ThenInclude(q => q.Questions)
                            .ThenInclude(qt => qt.Options)
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            double avgRating = course.Reviews.Any() ? course.Reviews.Average(r => r.Rating) : 0;
            int reviewsCount = course.Reviews.Count;
            int studentsCount = course.Enrollments.Count;

            var result = new
            {
                course.Id,
                course.Title,
                course.Description,
                course.Category,
                course.Level,
                course.Price,
                ImageSrc = course.ImageUrl,
                ImageUrl = course.ImageUrl,
                AverageRating = avgRating,
                ReviewsCount = reviewsCount,
                StudentsCount = studentsCount,
                InstructorId = course.InstructorId,
                Instructor = course.Instructor != null ? new
                {
                    Name = course.Instructor.UserName,
                    AvatarUrl = course.Instructor.AvatarUrl,
                    AvatarSrc = "/src/icon/usericon.png",
                    Bio = "Instruktor"
                } : null,
                Sections = course.Sections.OrderBy(s => s.Order).Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Order,
                    Lessons = s.Lessons.Select(l => new
                    {
                        l.Id,
                        l.Title,
                        l.Content,
                        l.VideoUrl,
                        Resources = l.Resources.Select(r => new
                        {
                            r.Id,
                            r.Name,
                            r.FileUrl
                        }).ToList()
                    }),
                    Quiz = s.Quiz != null ? new
                    {
                        s.Quiz.Id,
                        s.Quiz.Title,
                        Questions = s.Quiz.Questions.Select(q => new
                        {
                            q.Id,
                            q.Text,
                            q.QuestionType,
                            Options = q.Options.Select(o => new { o.Id, o.Text, o.IsCorrect })
                        })
                    } : null
                })
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<ActionResult<object>> CreateCourse(Course course)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { title = "Nie udało się zidentyfikować użytkownika. Zaloguj się ponownie." });
                }

                course.InstructorId = userId;

                if (string.IsNullOrEmpty(course.ImageUrl))
                {
                    course.ImageUrl = "/src/course/placeholder_ai.png";
                }

                if (course.Sections == null) course.Sections = new List<CourseSection>();

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                var result = new
                {
                    course.Id,
                    course.Title,
                    course.Description,
                    course.Category,
                    course.Level,
                    course.Price,
                    ImageSrc = course.ImageUrl,
                    ImageUrl = course.ImageUrl,
                    AverageRating = 0,
                    ReviewsCount = 0,
                    StudentsCount = 0,
                    Instructor = new { Name = User.Identity?.Name ?? "Ja", Bio = "Instruktor" },
                    Sections = course.Sections.Select(s => new
                    {
                        s.Id,
                        s.Title,
                        s.Order,
                        Lessons = s.Lessons.Select(l => new
                        {
                            l.Id,
                            l.Title,
                            l.Content,
                            l.VideoUrl
                        }),
                        Quiz = s.Quiz != null ? new
                        {
                            s.Quiz.Id,
                            s.Quiz.Title
                        } : null
                    })
                };

                return StatusCode(201, result);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException != null ? ex.InnerException.Message : "";
                return StatusCode(500, new { title = $"Błąd serwera: {ex.Message} {innerMessage}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] Course course)
        {
            if (id != course.Id)
            {
                return BadRequest("ID kursu w URL nie zgadza się z ID w ciele żądania.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existingCourse = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                        .ThenInclude(l => l.Resources)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Quiz)
                        .ThenInclude(q => q.Questions)
                            .ThenInclude(qt => qt.Options)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingCourse == null) return NotFound();

            if (existingCourse.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.Category = course.Category;
            existingCourse.Level = course.Level;
            existingCourse.Price = course.Price;

            if (!string.IsNullOrEmpty(course.ImageUrl))
            {
                existingCourse.ImageUrl = course.ImageUrl;
            }

            bool hasNewContent = false;

            var incomingSectionIds = course.Sections.Where(s => s.Id > 0).Select(s => s.Id).ToList();
            var sectionsToDelete = existingCourse.Sections.Where(s => !incomingSectionIds.Contains(s.Id)).ToList();

            foreach (var sectionToDelete in sectionsToDelete)
            {
                _context.CourseSections.Remove(sectionToDelete);
            }

            foreach (var sectionDto in course.Sections)
            {
                if (sectionDto.Id > 0)
                {
                    var existingSection = existingCourse.Sections.FirstOrDefault(s => s.Id == sectionDto.Id);
                    if (existingSection != null)
                    {
                        existingSection.Title = sectionDto.Title;
                        existingSection.Order = sectionDto.Order;

                        var incomingLessonIds = sectionDto.Lessons.Where(l => l.Id > 0).Select(l => l.Id).ToList();
                        var lessonsToDelete = existingSection.Lessons.Where(l => !incomingLessonIds.Contains(l.Id)).ToList();

                        foreach (var l in lessonsToDelete) _context.Lessons.Remove(l);

                        foreach (var lessonDto in sectionDto.Lessons)
                        {
                            if (lessonDto.Id == 0)
                            {
                                hasNewContent = true;
                                existingSection.Lessons.Add(new Lesson
                                {
                                    Title = lessonDto.Title,
                                    Content = lessonDto.Content,
                                    VideoUrl = lessonDto.VideoUrl,
                                    Resources = lessonDto.Resources
                                });
                            }
                            else
                            {
                                var existingLesson = existingSection.Lessons.FirstOrDefault(l => l.Id == lessonDto.Id);
                                if (existingLesson != null)
                                {
                                    existingLesson.Title = lessonDto.Title;
                                    existingLesson.Content = lessonDto.Content;
                                    existingLesson.VideoUrl = lessonDto.VideoUrl;

                                    var incomingResIds = lessonDto.Resources.Where(r => r.Id > 0).Select(r => r.Id).ToList();
                                    var resourcesToDeleteFromLesson = existingLesson.Resources
                                        .Where(r => !incomingResIds.Contains(r.Id)).ToList();

                                    foreach (var r in resourcesToDeleteFromLesson)
                                    {
                                        _context.LessonResources.Remove(r);
                                    }

                                    foreach (var resDto in lessonDto.Resources)
                                    {
                                        if (resDto.Id == 0)
                                        {
                                            existingLesson.Resources.Add(new LessonResource
                                            {
                                                Name = resDto.Name,
                                                FileUrl = resDto.FileUrl
                                            });
                                        }
                                    }
                                }
                            }
                        }

                        if (sectionDto.Quiz != null)
                        {
                            if (existingSection.Quiz == null)
                            {
                                sectionDto.Quiz.Id = 0;
                                if (sectionDto.Quiz.Questions != null)
                                {
                                    foreach (var q in sectionDto.Quiz.Questions)
                                    {
                                        q.Id = 0;
                                        if (q.Options != null) foreach (var o in q.Options) o.Id = 0;
                                    }
                                }
                                existingSection.Quiz = sectionDto.Quiz;
                            }
                            else
                            {
                                existingSection.Quiz.Title = sectionDto.Quiz.Title;

                                var incomingQIds = sectionDto.Quiz.Questions.Where(q => q.Id > 0).Select(q => q.Id).ToList();
                                var questionsToDelete = existingSection.Quiz.Questions.Where(q => !incomingQIds.Contains(q.Id)).ToList();
                                foreach (var q in questionsToDelete) _context.Questions.Remove(q);

                                foreach (var qDto in sectionDto.Quiz.Questions)
                                {
                                    if (qDto.Id == 0)
                                    {
                                        if (qDto.Options != null) foreach (var o in qDto.Options) o.Id = 0;
                                        existingSection.Quiz.Questions.Add(qDto);
                                    }
                                    else
                                    {
                                        var existingQ = existingSection.Quiz.Questions.FirstOrDefault(q => q.Id == qDto.Id);
                                        if (existingQ != null)
                                        {
                                            existingQ.Text = qDto.Text;
                                            existingQ.QuestionType = qDto.QuestionType;

                                            var incomingOIds = qDto.Options.Where(o => o.Id > 0).Select(o => o.Id).ToList();
                                            var optionsToDelete = existingQ.Options.Where(o => !incomingOIds.Contains(o.Id)).ToList();
                                            foreach (var o in optionsToDelete) _context.AnswerOptions.Remove(o);

                                            foreach (var oDto in qDto.Options)
                                            {
                                                if (oDto.Id == 0) existingQ.Options.Add(oDto);
                                                else
                                                {
                                                    var existingO = existingQ.Options.FirstOrDefault(o => o.Id == oDto.Id);
                                                    if (existingO != null)
                                                    {
                                                        existingO.Text = oDto.Text;
                                                        existingO.IsCorrect = oDto.IsCorrect;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (existingSection.Quiz != null)
                        {
                            _context.Quizzes.Remove(existingSection.Quiz);
                        }
                    }
                }
                else
                {
                    hasNewContent = true;
                    if (sectionDto.Lessons != null)
                    {
                        foreach (var l in sectionDto.Lessons)
                        {
                            l.Id = 0;
                            if (l.Resources != null)
                                foreach (var r in l.Resources) r.Id = 0;
                        }
                    }
                    if (sectionDto.Quiz != null)
                    {
                        sectionDto.Quiz.Id = 0;
                        if (sectionDto.Quiz.Questions != null)
                        {
                            foreach (var q in sectionDto.Quiz.Questions)
                            {
                                q.Id = 0;
                                if (q.Options != null) foreach (var o in q.Options) o.Id = 0;
                            }
                        }
                    }
                    existingCourse.Sections.Add(sectionDto);
                }
            }

            try
            {
                await _context.SaveChangesAsync();

                if (hasNewContent)
                {
                    var enrolledUserIds = await _context.Enrollments
                        .Where(e => e.CourseId == id)
                        .Select(e => e.UserId)
                        .ToListAsync();

                    if (enrolledUserIds.Any())
                    {
                        var notifications = enrolledUserIds.Select(uid => new Notification
                        {
                            UserId = uid,
                            Message = $"Nowa treść została dodana do kursu '{existingCourse.Title}'. Sprawdź co nowego!",
                            Type = "update",
                            CreatedAt = DateTime.UtcNow,
                            RelatedEntityId = id
                        }).ToList();

                        _context.Notifications.AddRange(notifications);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd zapisu: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");

                return StatusCode(500, new { title = $"Błąd podczas zapisu kursu: {ex.Message}" });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin,User")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}