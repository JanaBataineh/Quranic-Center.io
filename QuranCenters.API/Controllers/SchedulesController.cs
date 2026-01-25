using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SchedulesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب جدول يوم محدد لمركز محدد
        [HttpGet("{centerId}/{day}")]
        public async Task<IActionResult> GetSchedule(string centerId, string day)
        {
            var sessions = await _context.Schedules
                .Include(s => s.Course)
                .Include(s => s.Teacher)
                .Where(s => s.CenterId == centerId && s.Day == day)
                .OrderBy(s => s.StartTime)
                .Select(s => new 
                {
                    s.Id,
                    CourseName = s.Course.Name,
                    TeacherName = s.Teacher.FirstName +" "+s.Teacher.LastName,
                    s.StartTime,
                    s.Location
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // 2. إضافة حصة جديدة
        [HttpPost("add")]
        public async Task<IActionResult> AddSession([FromBody] Schedule model)
        {
            if (model == null) return BadRequest();
            
            _context.Schedules.Add(model);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "تمت إضافة الحصة بنجاح" });
        }

        // 3. حذف حصة
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            var session = await _context.Schedules.FindAsync(id);
            if (session == null) return NotFound();

            _context.Schedules.Remove(session);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم الحذف" });
        }
    }
}