using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.DTOs;
using QuranCenters.API.Data; // 1. إضافة Using لقاعدة البيانات
using QuranCenters.API.Models; // 2. إضافة Using للنماذج
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore; // 3. إضافة Using لـ EF Core

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        // 4. تعريف متغير DbContext
        private readonly ApplicationDbContext _context;

        // 5. استخدام "حقن التبعية" (Dependency Injection) لربط المتحكم بقاعدة البيانات
        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // 1. GET: /api/Admin/stats (إحصائيات)
        // =======================================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            // محاكاة سريعة للإحصائيات (يمكن تحويلها لبيانات حقيقية لاحقًا)
            var stats = new AdminStatsDto
            {
                TotalCenters = await _context.Centers.CountAsync(), // <-- قراءة حقيقية
                TotalCourses = 0, // (لم نضف جدول الدورات بعد)
                TotalUsers = 0, // (لم نضف جدول المستخدمين بعد)
                PendingCenters = await _context.Centers.CountAsync(c => c.Status == "pending"), // <-- قراءة حقيقية
                PendingCourses = 0,
                NewMessages = 0
            };
            return Ok(stats);
        }

        // =======================================================
        // 2. GET: /api/Admin/centers (جلب جميع المراكز)
        // =======================================================
        [HttpGet("centers")]
        public async Task<IActionResult> GetCenters()
        {
            // 6. استبدال البيانات الوهمية ببيانات الداتابيز الحقيقية
            var centers = await _context.Centers.ToListAsync();
            return Ok(centers);
        }

        // =======================================================
        // 3. GET: /api/Admin/centers/{id} (جلب مركز واحد)
        // =======================================================
        [HttpGet("centers/{id}")]
        public async Task<IActionResult> GetCenterById(string id)
        {
            var center = await _context.Centers.FindAsync(id);

            if (center == null)
            {
                return NotFound(new { message = $"لم يتم العثور على المركز بالمعرّف {id}" });
            }
            return Ok(center);
        }

        // =======================================================
        // 4. POST: /api/Admin/centers (إنشاء مركز جديد)
        // =======================================================
        [HttpPost("centers")]
        public async Task<IActionResult> CreateCenter([FromBody] CenterDto newCenterDto)
        {
            // **** هذا هو السطر الذي تم تصحيحه ****
            // تم تغيير 'newCenter.Name' إلى 'newCenterDto.Name'
            if (string.IsNullOrWhiteSpace(newCenterDto.Name) || string.IsNullOrWhiteSpace(newCenterDto.City))
            {
                return BadRequest(new { message = "بيانات المركز غير مكتملة (الاسم والمدينة مطلوبة)." });
            }

            // تحويل DTO إلى نموذج قاعدة بيانات
            var center = new Center
            {
                Name = newCenterDto.Name,
                City = newCenterDto.City,
                Address = newCenterDto.Address,
                Phone = newCenterDto.Phone,
                Email = newCenterDto.Email,
                Established = newCenterDto.Established,
                Status = "pending", // دائمًا "معلق" عند الإنشاء
                CreatedAt = DateTime.Now
            };

            await _context.Centers.AddAsync(center);
            await _context.SaveChangesAsync(); // حفظ في قاعدة البيانات

            return CreatedAtAction(nameof(GetCenterById), new { id = center.Id }, center);
        }

        // =======================================================
        // 5. PUT: /api/Admin/centers/{id} (تعديل مركز)
        // =======================================================
        [HttpPut("centers/{id}")]
        public async Task<IActionResult> UpdateCenter(string id, [FromBody] CenterDto updatedCenterDto)
        {
            var center = await _context.Centers.FindAsync(id);

            if (center == null)
            {
                return NotFound(new { message = $"لم يتم العثور على المركز بالمعرّف {id} للتعديل." });
            }

            // تحديث البيانات
            center.Name = updatedCenterDto.Name;
            center.City = updatedCenterDto.City;
            center.Address = updatedCenterDto.Address;
            center.Phone = updatedCenterDto.Phone;
            center.Email = updatedCenterDto.Email;
            center.Established = updatedCenterDto.Established;
            // (لا نعدل الحالة من هنا، نستخدم ApproveCenter)

            _context.Centers.Update(center);
            await _context.SaveChangesAsync(); // حفظ التعديلات

            return Ok(new { message = $"تم حفظ التعديلات على المركز \"{center.Name}\" بنجاح.", center = center });
        }

        // =======================================================
        // 6. PUT: /api/Admin/centers/approve/{id} (اعتماد مركز)
        // =======================================================
        [HttpPut("centers/approve/{id}")]
        public async Task<IActionResult> ApproveCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);

            if (center == null)
            {
                return NotFound(new { message = $"لم يتم العثور على المركز بالمعرّف {id}" });
            }

            center.Status = "approved"; // تغيير الحالة
            await _context.SaveChangesAsync(); // حفظ

            return Ok(new { message = $"تم اعتماد المركز \"{center.Name}\" بنجاح.", center = center });
        }

        // =======================================================
        // 7. DELETE: /api/Admin/centers/{id} (حذف مركز)
        // =======================================================
        [HttpDelete("centers/{id}")]
        public async Task<IActionResult> DeleteCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);

            if (center == null)
            {
                return NotFound(new { message = $"لم يتم العثور على المركز بالمعرّف {id}" });
            }

            _context.Centers.Remove(center); // حذف
            await _context.SaveChangesAsync(); // حفظ

            return Ok(new { message = $"تم حذف المركز \"{center.Name}\" بنجاح." });
        }
    }
}