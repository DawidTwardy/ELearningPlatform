using ELearning.Api.DTOs.Quiz;
using ELearning.Api.Interfaces;
using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using ELearning.Api.Models.CourseContent;

namespace ELearning.Api.Services
{
    public class QuizService : IQuizService
    {
        private readonly ApplicationDbContext _context;

        public QuizService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<QuizQuestionsDto?> GetQuizByIdAsync(int quizId, string userId)
        {
            // £adujemy quiz z jego pytaniami i opcjami
            var quiz = await _context.Quizzes
                .Where(q => q.Id == quizId)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .Select(q => new QuizQuestionsDto
                {
                    // Mapowanie na DTO. Zapewniamy, ¿e nazwy pól DTO s¹ u¿ywane (np. QuestionId)
                    QuizId = q.Id,
                    Title = q.Title,
                    SectionId = q.SectionId,
                    Questions = q.Questions.Select(qs => new QuestionDto
                    {
                        QuestionId = qs.Id,
                        Text = qs.Text,
                        QuestionType = qs.QuestionType,
                        Options = qs.Options.Select(o => new AnswerOptionDto
                        {
                            AnswerOptionId = o.Id,
                            Text = o.Text
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return quiz;
        }

        public async Task<QuizResultDto> SubmitQuizAsync(SubmitQuizDto submitDto, string userId)
        {
            var quizId = submitDto.QuizId;

            // 1. Pobranie poprawnych odpowiedzi dla quizu
            // U¿ywamy z³¹czenia implicite poprzez Question, aby upewniæ siê, ¿e pobieramy tylko dla danego quizu
            var correctAnswers = await _context.AnswerOptions
                .Where(o => o.Question.QuizId == quizId && o.IsCorrect)
                .ToDictionaryAsync(o => o.QuestionId, o => o.Id);

            int score = 0;
            int maxScore = correctAnswers.Count;

            var userAttempt = new Models.CourseContent.UserQuizAttempt
            {
                QuizId = quizId,
                UserId = userId,
                MaxScore = maxScore
            };

            // 2. Porównanie odpowiedzi i obliczenie wyniku
            foreach (var submittedAnswer in submitDto.Answers)
            {
                // Musimy upewniæ siê, ¿e submittedAnswer.QuestionId istnieje w correctAnswers
                var isCorrect = correctAnswers.TryGetValue(submittedAnswer.QuestionId, out var correctOptionId) && correctOptionId == submittedAnswer.AnswerOptionId;

                userAttempt.UserAnswers.Add(new Models.CourseContent.UserAnswer
                {
                    QuestionId = submittedAnswer.QuestionId,
                    AnswerOptionId = submittedAnswer.AnswerOptionId,
                    IsCorrect = isCorrect
                });

                if (isCorrect)
                {
                    score++;
                }
            }

            userAttempt.Score = score;

            // Za³o¿enie: zaliczony przy 80% poprawnych odpowiedzi
            userAttempt.IsPassed = maxScore > 0 && (double)score / maxScore >= 0.8;

            // 3. Zapisanie próby
            _context.UserQuizAttempts.Add(userAttempt);
            await _context.SaveChangesAsync();

            // 4. Pobranie liczby prób
            var attemptsCount = await _context.UserQuizAttempts
                .CountAsync(a => a.QuizId == quizId && a.UserId == userId);

            // 5. Zwrócenie wyniku
            return new QuizResultDto
            {
                Score = score,
                MaxScore = maxScore,
                IsPassed = userAttempt.IsPassed,
                AttemptsCount = attemptsCount
            };
        }
    }
}