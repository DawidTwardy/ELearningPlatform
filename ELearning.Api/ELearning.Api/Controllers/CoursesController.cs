using ELearning.Api.Persistence; 
using ELearning.Api.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 

namespace ELearning.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        
        private readonly ApplicationDbContext _context;

       
        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
           
            var courses = await _context.Courses.ToListAsync();

            return Ok(courses); 
        }
    }
}