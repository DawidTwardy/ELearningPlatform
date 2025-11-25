using ELearning.Api.DTOs.Discussion;
using ELearning.Api.Models;
using ELearning.Api.Models.CourseContent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using ELearning.Api.Persistence;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CommentsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetComments(int courseId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.CourseId == courseId)
                .OrderBy(c => c.Created)
                .ToListAsync();

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                // Zabezpieczenie: Jeœli u¿ytkownik zosta³ usuniêty (c.User jest null), wstawiamy domyœlne wartoœci
                UserName = c.User != null ? c.User.UserName : "Nieznany u¿ytkownik",
                AvatarUrl = c.User != null ? c.User.AvatarUrl : null,
                Created = c.Created,
                ParentCommentId = c.ParentCommentId
            }).ToList();

            var hierarchy = BuildCommentHierarchy(commentDtos);
            return Ok(hierarchy);
        }

        private List<CommentDto> BuildCommentHierarchy(List<CommentDto> allComments)
        {
            var rootComments = allComments.Where(c => c.ParentCommentId == null).ToList();
            foreach (var root in rootComments)
            {
                AddReplies(root, allComments);
            }
            return rootComments;
        }

        private void AddReplies(CommentDto parent, List<CommentDto> allComments)
        {
            parent.Replies = allComments.Where(c => c.ParentCommentId == parent.Id).ToList();
            foreach (var reply in parent.Replies)
            {
                AddReplies(reply, allComments);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();

            var comment = new Comment
            {
                Content = model.Content,
                Created = DateTime.UtcNow,
                CourseId = model.CourseId,
                UserId = userId,
                ParentCommentId = model.ParentCommentId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                UserName = user.UserName,
                AvatarUrl = user.AvatarUrl,
                Created = comment.Created,
                ParentCommentId = comment.ParentCommentId
            });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null) return NotFound();

            if (comment.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            await DeleteChildrenRecursive(comment.Id);

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task DeleteChildrenRecursive(int parentId)
        {
            var children = await _context.Comments.Where(c => c.ParentCommentId == parentId).ToListAsync();
            foreach (var child in children)
            {
                await DeleteChildrenRecursive(child.Id);
                _context.Comments.Remove(child);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null) return NotFound();
            if (comment.UserId != userId) return Forbid();

            comment.Content = model.Content;
            await _context.SaveChangesAsync();

            // ZMIANA: Zwracamy NoContent (204) zamiast pustego Ok (200), aby frontend nie próbowa³ parsowaæ JSONa
            return NoContent();
        }
    }

    public class CreateCommentDto
    {
        public int CourseId { get; set; }
        public string Content { get; set; }
        public int? ParentCommentId { get; set; }
    }

    public class UpdateCommentDto
    {
        public string Content { get; set; }
    }
}