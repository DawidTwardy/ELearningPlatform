using ELearning.Api.DTOs.Quiz;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ELearning.Api.Interfaces
{
    public interface IQuizService
    {
        Task<QuizQuestionsDto?> GetQuizByIdAsync(int quizId, string userId);
        Task<QuizResultDto> SubmitQuizAsync(SubmitQuizDto submitDto, string userId);
        Task<QuizQuestionsDto> GenerateDailyReviewAsync(string userId);
        Task<QuizResultDto> SubmitDailyReviewAsync(List<SubmittedAnswerDto> answers, string userId);
    }
}