using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.DTOs;
using QuranCenters.API.Data; 
using QuranCenters.API.Models; 
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore; 

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. الإحصائيات
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new AdminStatsDto
            {
                TotalCenters = await _context.Centers.CountAsync(), 
                TotalCourses = await _context.Courses.CountAsync(), 
                TotalUsers = await _context.Users.CountAsync(),
                PendingCenters = await _context.Centers.CountAsync(c => c.Status == "pending"),
                PendingCourses = await _context.Courses.CountAsync(c => c.Status == "pending"),
                NewMessages = 0 
            };
            return Ok(stats);
        }

        // 2. إدارة المراكز (دوال موحدة)
        [HttpGet("centers")]
        public async Task<IActionResult> GetCenters()
        {
            return Ok(await _context.Centers.OrderBy(c => c.CreatedAt).ToListAsync());
        }

        [HttpGet("centers/{id}")]
        public async Task<IActionResult> GetCenterById(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود." });
            return Ok(center);
        }
        
        [HttpPost("centers")]
        public async Task<IActionResult> CreateCenter([FromBody] CenterDto centerDto)
        {
            var center = new Center
            {
                Name = centerDto.Name,
                City = centerDto.City,
                Address = centerDto.Address,
                Phone = centerDto.Phone,
                Email = centerDto.Email,
                Established = centerDto.Established,
                Status = "pending",
                CreatedAt = DateTime.Now
            };
            _context.Centers.Add(center);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تمت إضافة المركز بنجاح.", center = center });
        }

        [HttpPut("centers/{id}")]
        public async Task<IActionResult> UpdateCenter(string id, [FromBody] CenterDto centerDto)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود." });

            center.Name = centerDto.Name;
            center.City = centerDto.City;
            center.Address = centerDto.Address;
            center.Phone = centerDto.Phone;
            center.Email = centerDto.Email;
            center.Established = centerDto.Established;

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تعديل البيانات.", center = center });
        }

        [HttpPut("centers/approve/{id}")]
        public async Task<IActionResult> ApproveCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود." });
            center.Status = "approved"; 
            await _context.SaveChangesAsync(); 
            return Ok(new { message = "تم اعتماد المركز.", center = center });
        }

        [HttpDelete("centers/{id}")]
        public async Task<IActionResult> DeleteCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود." });
            _context.Centers.Remove(center); 
            await _context.SaveChangesAsync(); 
            return Ok(new { message = "تم حذف المركز." });
        }

        // 3. إدارة الدورات (دوال موحدة)
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            return Ok(await _context.Courses.ToListAsync());
        }

        [HttpGet("courses/{id}")]
        public async Task<IActionResult> GetCourseById(string id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound(new { message = "الدورة غير موجودة." });
            return Ok(course);
        }

        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CourseDto courseDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var centerExists = await _context.Centers.AnyAsync(c => c.Id == courseDto.CenterId);
            if (!centerExists) return BadRequest(new { message = "المركز غير موجود." });

            var newCourse = new Course
            {
                Name = courseDto.Name,
                Level = courseDto.Level,
                Price = courseDto.Price,
                CenterId = courseDto.CenterId,
                Status = "pending"
            };
            _context.Courses.Add(newCourse);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تمت إضافة الدورة.", course = newCourse });
        }

        [HttpPut("courses/{id}")]
        public async Task<IActionResult> UpdateCourse(string id, [FromBody] CourseDto courseDto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound(new { message = "الدورة غير موجودة." });
            course.Name = courseDto.Name;
            course.Level = courseDto.Level;
            course.Price = courseDto.Price;
            course.CenterId = courseDto.CenterId;
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تعديل الدورة.", course = course });
        }

        [HttpPut("courses/approve/{id}")]
        public async Task<IActionResult> ApproveCourse(string id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound(new { message = "الدورة غير موجودة." });
            course.Status = "approved";
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم اعتماد الدورة." });
        }

        [HttpDelete("courses/{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound(new { message = "الدورة غير موجودة." });
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حذف الدورة." });
        }
    }
}