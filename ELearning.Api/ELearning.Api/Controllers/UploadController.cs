using ELearning.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ELearning.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly FileStorageService _fileStorageService;

        public UploadController(FileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                var allowedExtensions = new[] { ".pdf", ".mp4", ".avi", ".mov", ".png", ".jpg", ".jpeg" };
                var extension = System.IO.Path.GetExtension(file.FileName).ToLower();

                if (Array.IndexOf(allowedExtensions, extension) < 0)
                {
                    return BadRequest("Niedozwolony format pliku.");
                }

                string fileUrl = await _fileStorageService.SaveFileAsync(file);

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"B³¹d serwera: {ex.Message}");
            }
        }
    }
}