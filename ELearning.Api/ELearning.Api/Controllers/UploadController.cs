using ELearning.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;

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
        [RequestSizeLimit(524288000)]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                var allowedExtensions = new[]
                {
                    ".png", ".jpg", ".jpeg", ".gif", ".webp",
                    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt",
                    ".mp4", ".avi", ".mov", ".wmv", ".mkv",
                    ".zip", ".rar", ".7z"
                };

                if (file == null || file.Length == 0)
                {
                    return BadRequest("Nie przes³ano pliku.");
                }

                var extension = System.IO.Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest($"Niedozwolony format pliku ({extension}).");
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