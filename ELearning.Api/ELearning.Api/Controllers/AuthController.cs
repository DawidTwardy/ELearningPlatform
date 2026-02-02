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
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using ELearning.Api.Persistence;

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
        private readonly ApplicationDbContext _context;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            IEmailService emailService,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _emailService = emailService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "Ten adres email jest już zajęty." });
            }

            var existingName = await _userManager.FindByNameAsync(model.Username);
            if (existingName != null)
            {
                return BadRequest(new { Message = "Ta nazwa użytkownika jest już zajęta." });
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

                var jwtToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                refreshToken.UserId = user.Id;
                _context.RefreshTokens.Add(refreshToken);
                await _context.SaveChangesAsync();

                try
                {
                    await _emailService.SendEmailAsync(user.Email, "Witamy w ELearning Platform!", $"<h3>Cześć {user.FirstName}!</h3><p>Dziękujemy za rejestrację.</p>");
                }
                catch { }

                return Ok(new AuthResponseDto
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken.Token,
                    AvatarUrl = user.AvatarUrl
                });
            }

            return BadRequest(new { Errors = result.Errors.Select(e => new { Code = e.Code, Description = e.Description }) });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user == null) return Unauthorized(new { Message = "Błędny login lub hasło." });

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (result.Succeeded)
            {
                var jwtToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();


                var oldTokens = _context.RefreshTokens.Where(t => t.UserId == user.Id && t.Expires < DateTime.UtcNow);
                _context.RefreshTokens.RemoveRange(oldTokens);

                refreshToken.UserId = user.Id;
                _context.RefreshTokens.Add(refreshToken);
                await _context.SaveChangesAsync();

                return Ok(new AuthResponseDto
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken.Token,
                    AvatarUrl = user.AvatarUrl
                });
            }

            return Unauthorized(new { Message = "Błędny login lub hasło." });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto tokenRequest)
        {
            if (string.IsNullOrEmpty(tokenRequest.RefreshToken))
                return BadRequest(new { Message = "Brak tokena odświeżania." });

            var storedToken = await _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(x => x.Token == tokenRequest.RefreshToken);

            if (storedToken == null || !storedToken.IsActive)
            {
                return Unauthorized(new { Message = "Nieprawidłowy lub wygasły token odświeżania." });
            }

            var user = storedToken.User;

            var newJwtToken = await GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            storedToken.Revoked = DateTime.UtcNow;
            storedToken.ReplacedByToken = newRefreshToken.Token;

            newRefreshToken.UserId = user.Id;
            _context.RefreshTokens.Add(newRefreshToken);

            _context.RefreshTokens.Update(storedToken);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Token = newJwtToken,
                RefreshToken = newRefreshToken.Token,
                AvatarUrl = user.AvatarUrl
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (string.IsNullOrEmpty(model.Email))
                return BadRequest(new { Message = "Email jest wymagany." });

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Nie znaleziono użytkownika o podanym adresie email." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = $"{_configuration["FrontendUrl"]}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

            var message = $@"
                <h3>Reset hasła</h3>
                <p>Kliknij w poniższy link, aby zresetować hasło:</p>
                <p><a href='{resetLink}'>Zresetuj hasło</a></p>
                <p>Twój token (w razie potrzeby): <b>{token}</b></p>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Reset hasła - ELearning Platform", message);
            }
            catch
            {
                return StatusCode(500, new { Message = "Nie udało się wysłać emaila." });
            }

            return Ok(new { Message = "Link resetujący został wysłany na podany email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Nie znaleziono użytkownika." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (result.Succeeded)
            {
                try
                {
                    await _emailService.SendEmailAsync(user.Email, "Hasło zmienione", "<p>Twoje hasło zostało pomyślnie zmienione.</p>");
                }
                catch { }

                return Ok(new { Message = "Hasło zostało pomyślnie zresetowane." });
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
            foreach (var role in roles) claims.Add(new Claim(ClaimTypes.Role, role));

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            };
        }
    }
}