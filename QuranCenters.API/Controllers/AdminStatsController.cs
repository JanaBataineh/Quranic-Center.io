using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.DTOs;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    // هذا الرابط هو ما يطلبه الجافاسكربت في لوحة التحكم
    [Route("api/admin/stats")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminStatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminStatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStats()
        {
            // تجميع الإحصائيات من الجداول المختلفة
            var stats = new AdminStatsDto
            {
                TotalCenters = await _context.Centers.CountAsync(),
                TotalCourses = await _context.Courses.CountAsync(),
                TotalUsers = await _context.Users.CountAsync(),
                PendingCenters = await _context.Centers.CountAsync(c => c.Status == "pending"),
                PendingCourses = await _context.Courses.CountAsync(c => c.Status == "pending"),
                NewMessages = await _context.ContactMessages.CountAsync(m => !m.IsRead)
            };

            return Ok(stats);
        }

        // 2. سجل النشاطات (لحل مشكلة 404 الثانية)
        // استخدمنا "/" في البداية لفرض رابط محدد يتجاهل الـ Route الأساسي للكلاس
        [HttpGet("/api/admin/activities")]
        public async Task<IActionResult> GetActivities()
        {
            // نتأكد أولاً أن الجدول موجود، وإذا لم يكن موجوداً نرجع قائمة فارغة لتجنب الخطأ
            // (في حال لم تكن قد أنشأت جدول ActivityLogs بعد)
            try 
            {
                var logs = await _context.ActivityLogs
                    .OrderByDescending(l => l.CreatedAt)
                    .Take(10)
                    .Select(l => new {
                        l.Id,
                        l.Action,
                        // l.UserId,
                        Date = l.CreatedAt // تأكد من اسم العمود في المودل
                    })
                    .ToListAsync();
                return Ok(logs);
            }
            catch
            {
                // في حال عدم وجود الجدول، نرجع قائمة وهمية مؤقتاً حتى لا تتعطل الواجهة
                return Ok(new List<object>()); 
            }
        }
    
    }
}