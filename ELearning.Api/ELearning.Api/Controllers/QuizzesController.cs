using ELearning.Api.DTOs.Quiz;
using ELearning.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly IGamificationService _gamificationService;

        public QuizzesController(IQuizService quizService, IGamificationService gamificationService)
        {
            _quizService = quizService;
            _gamificationService = gamificationService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            var quiz = await _quizService.GetQuizByIdAsync(id, GetUserId());

            if (quiz == null)
            {
                return NotFound();
            }

            return Ok(quiz);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizDto submitDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _quizService.SubmitQuizAsync(submitDto, GetUserId());

            if (result.IsPassed)
            {
                await _gamificationService.UpdateStreakAsync(GetUserId());
                await _gamificationService.AddPointsAsync(GetUserId(), 50);
                await _gamificationService.CheckBadgesAsync(GetUserId());
            }

            return Ok(result);
        }
    }
}