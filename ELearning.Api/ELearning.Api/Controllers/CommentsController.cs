using ELearning.Api.DTOs.Discussion;
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
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(int courseId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.CourseId == courseId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var rootComments = comments.Where(c => c.ParentCommentId == null).ToList();
            var dtos = rootComments.Select(c => MapToDto(c, comments)).ToList();

            return Ok(dtos);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment([FromBody] CreateCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var comment = new Comment
            {
                CourseId = dto.CourseId,
                Content = dto.Content,
                ParentCommentId = dto.ParentCommentId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var createdComment = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == comment.Id);

            return Ok(MapToDto(createdComment, new List<Comment>()));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null) return NotFound();
            if (comment.UserId != userId) return Forbid();

            comment.Content = dto.Content;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments.Include(c => c.Replies).FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null) return NotFound();
            if (comment.UserId != userId) return Forbid();

            await DeleteCommentRecursive(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task DeleteCommentRecursive(Comment comment)
        {
            var replies = await _context.Comments
                .Include(c => c.Replies)
                .Where(c => c.ParentCommentId == comment.Id)
                .ToListAsync();

            foreach (var reply in replies)
            {
                await DeleteCommentRecursive(reply);
            }
            _context.Comments.Remove(comment);
        }

        private CommentDto MapToDto(Comment comment, List<Comment> allComments)
        {
            var dto = new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                Author = comment.User?.UserName ?? "Nieznany",
                Avatar = "/src/icon/usericon.png",
                Text = comment.Content,
                CreatedAt = comment.CreatedAt
            };

            var replies = allComments.Where(c => c.ParentCommentId == comment.Id).OrderBy(c => c.CreatedAt).ToList();
            dto.Replies = replies.Select(r => MapToDto(r, allComments)).ToList();

            return dto;
        }
    }
}