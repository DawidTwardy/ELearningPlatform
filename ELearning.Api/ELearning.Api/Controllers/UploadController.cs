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
        [RequestSizeLimit(209715200)] // Zwiêkszamy limit dla tej metody do 200 MB
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                var allowedExtensions = new[] { ".pdf", ".mp4", ".avi", ".mov", ".png", ".jpg", ".jpeg" };
                // Sprawdzenie nulla przed dostêpem do FileName
                if (file == null || file.Length == 0)
                {
                    return BadRequest("Nie przes³ano pliku.");
                }

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
                // Poprawiono literówkê w s³owie "B³¹d"
                return StatusCode(500, $"B³¹d serwera: {ex.Message}");
            }
        }
    }
}