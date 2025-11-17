using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.DTOs;
using QuranCenters.API.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace QuranCenters.API.Controllers
{
    [Authorize(Roles = "Center")]
    [Route("api/[controller]")]
    [ApiController]
    public class CenterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CenterController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🌟🌟 دالة مساعدة للحصول على CenterId من التوكن
        private string? GetCenterIdFromToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var center = _context.Centers.FirstOrDefault(c => c.Id == userId);

            return center?.Id;
        }

        // =======================================================
        // 1. GET: /api/Center/my-info
        // =======================================================
        [HttpGet("my-info")]
        public async Task<IActionResult> GetMyInfo()
        {
            var centerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(centerId))
            {
                return Unauthorized(new { message = "بيانات التحقق مفقودة أو غير صالحة." });
            }

            var center = await _context.Centers.FindAsync(centerId);

            if (center == null)
            {
                return NotFound(new { message = "لم يتم العثور على المركز المرتبط بحسابك." });
            }

            return Ok(center);
        }

        // =======================================================
        // 2. GET: /api/Center/courses
        // =======================================================
        [HttpGet("courses")]
        public async Task<IActionResult> GetCenterCourses()
        {
            var centerId = GetCenterIdFromToken();
            if (centerId == null)
                return Unauthorized(new { message = "غير مصرح لك." });

            var courses = await _context.Courses
                .Where(c => c.CenterId == centerId)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(courses);
        }

        // =======================================================
        // 3. POST: /api/Center/courses (إضافة دورة جديدة)
        // =======================================================
[HttpPost("courses")]
public async Task<IActionResult> CreateCourse([FromBody] CourseDto courseDto)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    // 🌟 التعديل: نأخذ الآيدي من التوكن لضمان الحماية بدلاً من البدي
    var centerId = GetCenterIdFromToken();
    if (centerId == null) return Unauthorized();

    var newCourse = new Course
    {
        Name = courseDto.Name,
        Level = courseDto.Level,
        Price = courseDto.Price,
        CenterId = centerId, // ✅ استخدام الآيدي المستخرج من التوكن
        Status = "pending"
    };

    _context.Courses.Add(newCourse);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تمت إضافة الدورة بنجاح، وهي بانتظار موافقة الأدمن.", course = newCourse });
}

        // =======================================================
        // 4. DELETE: /api/Center/courses/{id}
        // =======================================================
        [HttpDelete("courses/{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            var centerId = GetCenterIdFromToken();
            if (centerId == null)
                return Unauthorized(new { message = "غير مصرح لك." });

            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound(new { message = "الدورة غير موجودة." });
            }

            // حماية IDOR — ملكية الدورة
            if (course.CenterId != centerId)
            {
                return StatusCode(403, new { message = "لا تملك الصلاحية لحذف دورة لا تخص مركزك." });
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"تم حذف الدورة \"{course.Name}\" بنجاح." });
        }
    }
}
