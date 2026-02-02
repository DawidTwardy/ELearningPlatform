using ELearning.Api.Persistence;
using ELearning.Api.DTOs.Quiz;
using ELearning.Api.Models.CourseContent;
using ELearning.Api.Models;
using ELearning.Api.Services;
using ELearning.Tests.Helpers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace ELearning.Tests.Services
{
    public class QuizServiceTests
    {
        [Fact]
        public async Task SubmitQuizAsync_ShouldCalculateScoreAndPass_WhenAnswersAreCorrect()
        {
            using var context = TestDatabaseHelper.GetDatabaseContext();
            var userId = "student-1";
            var quiz = new Quiz { Id = 1, Title = "Quiz Testowy", SectionId = 1 };
            context.Quizzes.Add(quiz);

            context.AnswerOptions.Add(new AnswerOption
            {
                Id = 10,
                Text = "Poprawna",
                Question = new Question
                {
                    Id = 100,
                    QuizId = 1,
                    Text = "Pytanie 1",
                    QuestionType = "SingleChoice"
                },
                IsCorrect = true
            });
            await context.SaveChangesAsync();

         
            context.ChangeTracker.Clear();

            var service = new QuizService(context);

            var submitDto = new SubmitQuizDto
            {
                QuizId = 1,
                Answers = new List<SubmittedAnswerDto> { new SubmittedAnswerDto { QuestionId = 100, AnswerOptionId = 10 } }
            };

            var result = await service.SubmitQuizAsync(submitDto, userId);

            Assert.Equal(1, result.Score);
            Assert.True(result.IsPassed);
        }

        [Fact]
        public async Task GenerateDailyReviewAsync_ShouldReturnExactlyFiveQuestions()
        {
            using var context = TestDatabaseHelper.GetDatabaseContext();
            var userId = "student-2";
            var courseId = 1;

     
            context.Enrollments.Add(new Enrollment { UserId = userId, CourseId = courseId, IsCompleted = true });

            
            var course = new Course { Id = courseId, Title = "Kurs Testowy" };
            var section = new CourseSection { Id = 10, CourseId = courseId, Course = course, Title = "Sekcja testowa" };
            var quiz = new Quiz { Id = 100, SectionId = 10, Section = section, Title = "Quiz testowy" };

            context.Courses.Add(course);
            context.CourseSections.Add(section);
            context.Quizzes.Add(quiz);

            
            for (int i = 1; i <= 10; i++)
            {
                context.Questions.Add(new Question
                {
                    Id = i,
                    Text = $"Pytanie {i}",
                    QuizId = 100,
                    Quiz = quiz
                });
            }

            await context.SaveChangesAsync();

         
            context.ChangeTracker.Clear();

            var service = new QuizService(context);

            
            var result = await service.GenerateDailyReviewAsync(userId);

            
            Assert.Equal(5, result.Questions.Count);
        }
    }
}