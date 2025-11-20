using ELearning.Api.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ELearning.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ELearning.Api.Interfaces;

namespace ELearning.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new ApplicationUser
            {
                UserName = model.Username,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                const string defaultRole = "User";

                if (!await _roleManager.RoleExistsAsync(defaultRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole(defaultRole));
                }

                await _userManager.AddToRoleAsync(user, defaultRole);

                try
                {
                    await _emailService.SendEmailAsync(
                        user.Email,
                        "Witamy w ELearning Platform!",
                        $"<h3>Czeœæ {user.FirstName}!</h3><p>Dziêkujemy za rejestracjê w naszej platformie. ¯yczymy owocnej nauki!</p>"
                    );
                }
                catch
                {
                }

                return Ok(new { Token = await GenerateJwtToken(user) });
            }

            return BadRequest(new
            {
                Errors = result.Errors.Select(e => new { Code = e.Code, Description = e.Description })
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);

            if (user == null)
            {
                return Unauthorized(new { Message = "B³êdny login lub has³o." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);

            if (result.Succeeded)
            {
                return Ok(new { Token = await GenerateJwtToken(user) });
            }

            return Unauthorized(new { Message = "B³êdny login lub has³o." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (string.IsNullOrEmpty(model.Email))
                return BadRequest("Email jest wymagany.");

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok(new { Message = "Jeœli konto istnieje, wys³aliœmy link resetuj¹cy." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var message = $"<h3>Reset has³a</h3><p>Twój token do resetu has³a to: <b>{token}</b></p>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Reset has³a - ELearning Platform", message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Nie uda³o siê wys³aæ emaila." });
            }

            return Ok(new { Message = "Jeœli konto istnieje, wys³aliœmy link resetuj¹cy." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok(new { Message = "Has³o zosta³o pomyœlnie zresetowane." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (result.Succeeded)
            {
                try
                {
                    await _emailService.SendEmailAsync(user.Email, "Has³o zmienione", "<p>Twoje has³o do ELearning Platform zosta³o pomyœlnie zmienione.</p>");
                }
                catch { }

                return Ok(new { Message = "Has³o zosta³o pomyœlnie zresetowane." });
            }

            return BadRequest(new
            {
                Errors = result.Errors.Select(e => new { Code = e.Code, Description = e.Description })
            });
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Email, user.Email!),
            };

            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtSettings = _configuration.GetSection("JwtSettings");

            var jwtKey = jwtSettings["Secret"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JwtSettings:Secret not configured or is null.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey.Trim()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}