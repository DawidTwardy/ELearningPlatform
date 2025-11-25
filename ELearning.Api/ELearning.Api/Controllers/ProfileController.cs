using ELearning.Api.DTOs.User;
using ELearning.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("U¿ytkownik nie znaleziony.");
            }

            var profileDto = new UpdateProfileDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl
            };

            return Ok(profileDto);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            var errors = new List<string>();

            if (user == null)
            {
                return NotFound("U¿ytkownik nie znaleziony.");
            }

            // Fix: Use null-coalescing operator to preserve existing value if model value is null
            user.FirstName = model.FirstName ?? user.FirstName;
            user.LastName = model.LastName ?? user.LastName;
            user.Bio = model.Bio ?? user.Bio; // Also good practice for Bio
            user.AvatarUrl = model.AvatarUrl ?? user.AvatarUrl; // FIXED: Prevents setting null


            if (!string.IsNullOrEmpty(model.UserName) && user.UserName != model.UserName)
            {
                var setUserNameResult = await _userManager.SetUserNameAsync(user, model.UserName);
                if (!setUserNameResult.Succeeded)
                {
                    errors.AddRange(setUserNameResult.Errors.Select(e => $"Nazwa u¿ytkownika: {e.Description}"));
                }
            }


            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                if (string.IsNullOrEmpty(model.CurrentPassword))
                {
                    errors.Add("Aby zmieniæ has³o, musisz podaæ aktualne has³o.");
                }
                else
                {
                    var changePasswordResult = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

                    if (!changePasswordResult.Succeeded)
                    {
                        errors.AddRange(changePasswordResult.Errors.Select(e => $"Has³o: {e.Description}"));
                    }
                }
            }


            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                errors.AddRange(updateResult.Errors.Select(e => e.Description));
            }

            if (errors.Any())
            {
                return BadRequest(new { message = "B³¹d walidacji profilu.", errors = errors });
            }

            return NoContent();
        }
    }
}