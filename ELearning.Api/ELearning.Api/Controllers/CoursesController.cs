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
        public async Task<ActionResult<IEnumerable<object>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
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
                Rating = 0,
                Instructor = c.Instructor != null ? new { Name = c.Instructor.UserName, Bio = "Instruktor" } : null
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
                Rating = 0,
                Instructor = c.Instructor != null ? new { Name = c.Instructor.UserName, Bio = "Instruktor" } : null
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                .Include(c => c.Sections)
                .ThenInclude(s => s.Quiz)
                .ThenInclude(q => q.Questions)
                .ThenInclude(qt => qt.Options)
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

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
                Rating = 0,
                Instructor = course.Instructor != null ? new
                {
                    Name = course.Instructor.UserName,
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
                        l.VideoUrl
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
                    Rating = 0,
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

            // 1. Pobierz istniejący kurs ze wszystkimi zależnościami
            var existingCourse = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
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

            // 2. Aktualizacja podstawowych pól kursu
            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.Category = course.Category;
            existingCourse.Level = course.Level;
            existingCourse.Price = course.Price;

            if (!string.IsNullOrEmpty(course.ImageUrl))
            {
                existingCourse.ImageUrl = course.ImageUrl;
            }

            // 3. Inteligentna synchronizacja Sekcji (zamiast usuwania wszystkiego)

            // A. Usuń sekcje, których nie ma w przychodzącym modelu
            // Jeśli ID sekcji z bazy nie znajduje się w liście ID przychodzących (tych > 0), usuń ją.
            var incomingSectionIds = course.Sections.Where(s => s.Id > 0).Select(s => s.Id).ToList();
            var sectionsToDelete = existingCourse.Sections.Where(s => !incomingSectionIds.Contains(s.Id)).ToList();

            foreach (var sectionToDelete in sectionsToDelete)
            {
                // Tutaj można dodać logikę usuwania powiązanych postępów jeśli FK blokują usuwanie,
                // ale zazwyczaj Cascade Delete w bazie powinno to obsłużyć.
                _context.CourseSections.Remove(sectionToDelete);
            }

            // B. Aktualizuj istniejące lub Dodaj nowe sekcje
            foreach (var sectionDto in course.Sections)
            {
                if (sectionDto.Id > 0)
                {
                    // Aktualizacja istniejącej sekcji
                    var existingSection = existingCourse.Sections.FirstOrDefault(s => s.Id == sectionDto.Id);
                    if (existingSection != null)
                    {
                        existingSection.Title = sectionDto.Title;
                        existingSection.Order = sectionDto.Order;

                        // --- Synchronizacja Lekcji w Sekcji ---
                        var incomingLessonIds = sectionDto.Lessons.Where(l => l.Id > 0).Select(l => l.Id).ToList();
                        var lessonsToDelete = existingSection.Lessons.Where(l => !incomingLessonIds.Contains(l.Id)).ToList();

                        // Usuń lekcje
                        foreach (var l in lessonsToDelete) _context.Lessons.Remove(l);

                        // Dodaj/Edytuj lekcje
                        foreach (var lessonDto in sectionDto.Lessons)
                        {
                            if (lessonDto.Id == 0)
                            {
                                // Nowa lekcja w istniejącej sekcji
                                existingSection.Lessons.Add(new Lesson
                                {
                                    Title = lessonDto.Title,
                                    Content = lessonDto.Content,
                                    VideoUrl = lessonDto.VideoUrl
                                });
                            }
                            else
                            {
                                // Edycja istniejącej lekcji
                                var existingLesson = existingSection.Lessons.FirstOrDefault(l => l.Id == lessonDto.Id);
                                if (existingLesson != null)
                                {
                                    existingLesson.Title = lessonDto.Title;
                                    existingLesson.Content = lessonDto.Content;
                                    existingLesson.VideoUrl = lessonDto.VideoUrl;
                                }
                            }
                        }

                        // --- Synchronizacja Quizu (Uproszczona: jeśli istnieje, aktualizuj; jeśli null w DTO, usuń) ---
                        if (sectionDto.Quiz != null)
                        {
                            if (existingSection.Quiz == null)
                            {
                                // Dodaj nowy quiz
                                sectionDto.Quiz.Id = 0; // Reset ID na wszelki wypadek
                                // Reset ID pytań/opcji
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
                                // Aktualizuj istniejący quiz
                                existingSection.Quiz.Title = sectionDto.Quiz.Title;

                                // Sync pytań w quizie
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

                                            // Sync opcji
                                            var incomingOIds = qDto.Options.Where(o => o.Id > 0).Select(o => o.Id).ToList();
                                            var optionsToDelete = existingQ.Options.Where(o => !incomingOIds.Contains(o.Id)).ToList();
                                            foreach (var o in optionsToDelete) _context.AnswerOptions.Remove(o); // Zakładam, że DbSet to AnswerOptions

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
                            // Użytkownik usunął quiz z sekcji
                            _context.Quizzes.Remove(existingSection.Quiz);
                        }
                    }
                }
                else
                {
                    // Nowa sekcja (ID == 0)
                    // Musimy upewnić się, że wszystkie dzieci też mają ID = 0, aby EF je wstawił
                    if (sectionDto.Lessons != null)
                    {
                        foreach (var l in sectionDto.Lessons) l.Id = 0;
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
                // Logowanie szczegółów błędu może pomóc w debugowaniu
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