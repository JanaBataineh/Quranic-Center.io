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
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب فعاليات المركز الحالي
        [HttpGet("my-events")]
        public async Task<IActionResult> GetMyEvents()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (center == null) return BadRequest("المركز غير موجود");

            var events = await _context.CenterEvents
                .Where(e => e.CenterId == center.Id)
                .OrderBy(e => e.Date)
                .ToListAsync();

            return Ok(events);
        }

        // 2. إضافة فعالية جديدة
        [HttpPost("add")]
        public async Task<IActionResult> AddEvent([FromBody] CenterEvent newEvent)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (center == null) return Unauthorized();

            newEvent.CenterId = center.Id;
            _context.CenterEvents.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم نشر الفعالية بنجاح" });
        }

        // 3. حذف فعالية
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var ev = await _context.CenterEvents.FindAsync(id);
            if (ev == null) return NotFound();

            _context.CenterEvents.Remove(ev);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حذف الفعالية" });
        }
    }
}