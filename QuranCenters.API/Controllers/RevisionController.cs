using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using Microsoft.EntityFrameworkCore;
namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevisionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RevisionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("log")]
        public async Task<IActionResult> LogRevision([FromBody] RevisionLog log)
        {
            log.ReviewedAt = DateTime.UtcNow;
            _context.RevisionLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حفظ نتيجة المراجعة بنجاح" });
        }
  // داخل RevisionController.cs

// جلب سجل مراجعات الطالب
[HttpGet("history/{studentId}")]
public async Task<IActionResult> GetStudentHistory(string studentId)
{
    var logs = await _context.RevisionLogs
        .Where(l => l.StudentId == studentId)
        .OrderByDescending(l => l.ReviewedAt) // الأحدث أولاً
        .Select(l => new 
        {
            l.Id,
            l.SurahName,
            l.Status, // Excellent or NeedsReview
            Date = l.ReviewedAt.ToString("yyyy-MM-dd"),
            Time = l.ReviewedAt.ToString("hh:mm tt")
        })
        .ToListAsync();

    return Ok(logs);
}
  
    }
}