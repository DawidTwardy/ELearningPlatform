using ELearning.Api.DTOs.Quiz;
using ELearning.Api.Interfaces;
using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
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
            var quiz = await _context.Quizzes
                .Where(q => q.Id == quizId)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .Select(q => new QuizQuestionsDto
                {
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

            foreach (var submittedAnswer in submitDto.Answers)
            {
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
            userAttempt.IsPassed = maxScore > 0 && (double)score / maxScore >= 0.8;

            _context.UserQuizAttempts.Add(userAttempt);
            await _context.SaveChangesAsync();

            var attemptsCount = await _context.UserQuizAttempts
                .CountAsync(a => a.QuizId == quizId && a.UserId == userId);

            return new QuizResultDto
            {
                Score = score,
                MaxScore = maxScore,
                IsPassed = userAttempt.IsPassed,
                AttemptsCount = attemptsCount
            };
        }

        public async Task<QuizQuestionsDto> GenerateDailyReviewAsync(string userId)
        {
            var completedCourseIds = await _context.Enrollments
                .Where(e => e.UserId == userId && e.IsCompleted)
                .Select(e => e.CourseId)
                .ToListAsync();

            if (!completedCourseIds.Any())
            {
                return new QuizQuestionsDto
                {
                    Title = "Codzienna powtórka",
                    Questions = new List<QuestionDto>()
                };
            }

            var candidateQuestions = await _context.Questions
                .Include(q => q.Options)
                .Include(q => q.Quiz)
                    .ThenInclude(qz => qz.Section)
                        .ThenInclude(s => s.Course)
                .Where(q => completedCourseIds.Contains(q.Quiz.Section.CourseId))
                .ToListAsync();

            var randomQuestions = candidateQuestions
                .OrderBy(r => Guid.NewGuid())
                .Take(5)
                .Select(qs => new QuestionDto
                {
                    QuestionId = qs.Id,
                    Text = qs.Text,
                    QuestionType = qs.QuestionType,

                    CourseTitle = qs.Quiz?.Section?.Course?.Title ?? "Nieznany kurs",
                    SectionTitle = qs.Quiz?.Section?.Title ?? "Nieznana sekcja",

                    Options = qs.Options.Select(o => new AnswerOptionDto
                    {
                        AnswerOptionId = o.Id,
                        Text = o.Text
                    }).ToList()
                })
                .ToList();

            return new QuizQuestionsDto
            {
                QuizId = 0,
                Title = "Codzienna powtórka",
                Questions = randomQuestions
            };
        }

        public async Task<QuizResultDto> SubmitDailyReviewAsync(List<SubmittedAnswerDto> answers, string userId)
        {
            var questionIds = answers.Select(a => a.QuestionId).ToList();

            var correctAnswers = await _context.AnswerOptions
                .Where(o => questionIds.Contains(o.QuestionId) && o.IsCorrect)
                .ToDictionaryAsync(o => o.QuestionId, o => o.Id);

            int score = 0;
            int maxScore = answers.Count;

            foreach (var answer in answers)
            {
                if (correctAnswers.TryGetValue(answer.QuestionId, out var correctId) && correctId == answer.AnswerOptionId)
                {
                    score++;
                }
            }

            return new QuizResultDto
            {
                Score = score,
                MaxScore = maxScore,
                IsPassed = score == maxScore,
                AttemptsCount = 1
            };
        }
    }
}