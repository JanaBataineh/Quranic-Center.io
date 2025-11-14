using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using System.Linq;
using System.Threading.Tasks;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // 1. GET: /api/Public/centers
        // (جلب جميع المراكز المعتمدة)
        // =======================================================
        [HttpGet("centers")]
        public async Task<IActionResult> GetApprovedCenters()
        {
            var centers = await _context.Centers
                .Where(c => c.Status.ToLower() == "approved")
                .OrderBy(c => c.Name)
                .ToListAsync();
            
            return Ok(centers);
        }

        // =======================================================
        // 2. GET: /api/Public/courses
        // (جلب جميع الدورات المعتمدة مع بيانات المركز)
        // =======================================================
        [HttpGet("courses")]
        public async Task<IActionResult> GetApprovedCourses()
        {
            var courses = await _context.Courses
                .Where(c => c.Status.ToLower() == "approved")
                // (Include) لجلب بيانات المركز المرتبط بالدورة
                .Include(c => c.Center) 
                .OrderBy(c => c.Name)
                .ToListAsync();

            // (تنسيق البيانات لتشبه ملف data.js القديم)
            var formattedCourses = courses.Select(c => new
            {
                c.Id,
                c.Name,
                c.Level,
                c.Price,
                c.Status,
                c.CenterId,
                CenterName = c.Center?.Name, // إضافة اسم المركز
                CenterCity = c.Center?.City, // إضافة مدينة المركز
                // (يمكنك إضافة باقي بيانات الدورة هنا مثل الوصف والمدة إذا أضفتها للنموذج)
                Description = "وصف تجريبي من الـ API",
                Duration = "3 أشهر",
                Instructor = "مدرب معتمد",
                Schedule = "مساءً"
            });

            return Ok(formattedCourses);
        }

     // =======================================================
        // 3. GET: /api/Public/stats
        // (جلب الإحصائيات العامة للموقع)
        // =======================================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetPublicStats()
        {
            var totalCenters = await _context.Centers.CountAsync(c => c.Status.ToLower() == "approved");
            
            // 🌟🌟 التصحيح هنا 🌟🌟
            var totalCourses = await _context.Courses.CountAsync(c => c.Status.ToLower() == "approved");
            
            var cities = await _context.Centers
                            .Where(c => c.Status.ToLower() == "approved")
                            .Select(c => c.City)
                            .Distinct()
                            .ToListAsync();

            return Ok(new 
            {
                TotalCenters = totalCenters,
                TotalCourses = totalCourses,
                TotalCities = cities.Count,
                Cities = cities.OrderBy(c => c)
            });
        }
    }
}