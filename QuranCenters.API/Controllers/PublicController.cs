using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data; // تأكد أن الاسم مطابق لاسم مشروعك
using QuranCenters.API.Models; // تأكد أن الاسم مطابق لاسم مشروعك
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;


namespace QuranCenters.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================================
        // 1) جلب المراكز (المعتمدة فقط)
        // ================================
        [HttpGet("centers")]
        public async Task<IActionResult> GetCenters([FromQuery] string city = "all")
        {
            var query = _context.Centers.AsQueryable();

            // إظهار المراكز المعتمدة فقط
            query = query.Where(c => c.Status == "approved");

            if (!string.IsNullOrWhiteSpace(city) && city != "all")
                query = query.Where(c => c.City == city);

            // جلب البيانات المطلوبة للعرض
            var data = await query
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.City,
                    c.Address,
                    c.Phone,
                    c.Email,
                    c.Established,
                    // وصف افتراضي لأن العمود غير موجود في قاعدة البيانات حالياً
                    Description = "مركز قرآني متميز يسعى لتعليم كتاب الله."
                })
                .ToListAsync();

            return Ok(data);
        }

        // ================================
        // 2) جلب الدورات (المعتمدة فقط)
        // ================================
        [HttpGet("courses")]
public async Task<IActionResult> GetCourses([FromQuery] string? centerId = null, [FromQuery] string city = "all", [FromQuery] string level = "all")        {
            var query = _context.Courses
                .Include(c => c.Center)
                // .Where(c => c.Status == "approved") // فقط الدورات المعتمدة
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(centerId))
                query = query.Where(c => c.CenterId == centerId);
        /*    if (!string.IsNullOrWhiteSpace(city) && city != "all")
                query = query.Where(c => c.Center.City == city);
*/
            if (!string.IsNullOrWhiteSpace(level) && level != "all")
                query = query.Where(c => c.Level == level);

            var data = await query
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Level,
                    c.Price,
                    Description = "دورة شاملة لتعليم القرآن الكريم وعلومه.", // وصف افتراضي
                    Instructor = "نخبة من المشايخ", // مدرس افتراضي
                    Duration = "3 أشهر", // مدة افتراضية
                    Schedule = "يحدد لاحقا",
                    CenterId = c.Center.Id,
                    CenterName = c.Center.Name,
                    CenterCity = "عمان"})
 // قيمة مؤقتة حتى تضيف المدينة لقاعدة البيانات                })
                .ToListAsync();

            return Ok(data);
        }

        // ================================
        // 3) جلب إحصائيات عامة (للموقع)
        // ================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                totalCenters = await _context.Centers.CountAsync(c => c.Status == "approved"),
                totalCourses = await _context.Courses.CountAsync(c => c.Status == "approved"),
                totalCities = await _context.Centers
                                    .Where(c => c.Status == "approved")
                                    .Select(c => c.City)
                                    .Distinct()
                                    .CountAsync(),
                // جلب قائمة المدن لتعبئة الفلتر في الفرونت إند
                cities = await _context.Centers
                                    .Where(c => c.Status == "approved")
                                    .Select(c => c.City)
                                    .Distinct()
                                    .ToListAsync()
            };
            return Ok(stats);
        }
    }
}