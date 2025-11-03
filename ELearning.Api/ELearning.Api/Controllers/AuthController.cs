// Plik: ELearningPlatform-main/ELearning.Api/ELearning.Api/Controllers/AuthController.cs

using ELearning.Api.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ELearning.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        /// <summary>Rejestruje nowego u¿ytkownika i zwraca token JWT.</summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Mapowanie DTO na ApplicationUser
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
                return Ok(new { Token = GenerateJwtToken(user) });
            }

            // POPRAWIONA OBS£UGA B£ÊDU: B³êdy s¹ mapowane na anonimowy obiekt DTO, 
            // który serializator JSON z ³atwoœci¹ przetworzy.
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => new { Code = e.Code, Description = e.Description })
            });
        }

        // POST: api/Auth/login
        /// <summary>Loguje u¿ytkownika i zwraca token JWT.</summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);

            if (user == null)
            {
                return Unauthorized(new { Message = "B³êdny login lub has³o." });
            }

            // Sprawdzenie has³a (bez logowania cookie)
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);

            if (result.Succeeded)
            {
                return Ok(new { Token = GenerateJwtToken(user) });
            }

            return Unauthorized(new { Message = "B³êdny login lub has³o." });
        }

        // Funkcja prywatna do generowania tokena JWT
        private string GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
            };

            // Upewniamy siê, ¿e klucz JWT jest dostêpny i ma poprawn¹ d³ugoœæ
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured or is null.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Token wa¿ny przez 7 dni
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}