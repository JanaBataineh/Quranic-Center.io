using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using System.Security.Claims;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context) => _context = context;

        // 1. جلب مهام المركز
        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (center == null) return BadRequest();

            var tasks = await _context.CenterTasks
                .Where(t => t.CenterId == center.Id)
                .ToListAsync();
            return Ok(tasks);
        }

        // 2. إضافة مهمة جديدة
        [HttpPost("add")]
        public async Task<IActionResult> AddTask([FromBody] CenterTask task)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (center == null) return Unauthorized();

            task.CenterId = center.Id;
            _context.CenterTasks.Add(task);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تمت إضافة المهمة" });
        }

        // 3. تحديث حالة المهمة (نقل بين القوائم)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var task = await _context.CenterTasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Status = newStatus;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 4. حذف مهمة
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.CenterTasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.CenterTasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}