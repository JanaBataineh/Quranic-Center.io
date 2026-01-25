using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CenterStaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CenterStaffController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =================================================================
        // 1. المركز يرسل طلب إضافة للمعلم (بواسطة رقم المعلم ID)
        // =================================================================

[HttpPost("invite-teacher")]
public async Task<IActionResult> InviteTeacher([FromBody] InviteTeacherDto dto)
{
       var center = await _context.Centers
        .FirstOrDefaultAsync(c => c.UserId == dto.CenterId); 

    if (center == null)
    {
        return BadRequest(new { message = "لم يتم العثور على مركز مرتبط بهذا المستخدم!" });
    }

    // 2. الآن نستخدم رقم المركز الحقيقي (center.Id) بدلاً من رقم المدير
    var realCenterId = center.Id;

    // 3. التحقق من التكرار
    var exists = await _context.CenterTeacherLinks
        .AnyAsync(x => x.CenterId == realCenterId && x.TeacherId == dto.TeacherId);
    
    if (exists) return BadRequest(new { message = "المعلم مضاف مسبقاً" });

    // 4. الحفظ بالرقم الصحيح
    var link = new CenterTeacherLink
    {
        CenterId = realCenterId, // ✅ هنا السر: نستخدم ID المركز الحقيقي
        TeacherId = dto.TeacherId,
        Status = "Pending",
        RequestDate = DateTime.UtcNow
    };

    _context.CenterTeacherLinks.Add(link);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تمت الإضافة بنجاح" });
}



        // =================================================================
        // 2. المعلم يرى الطلبات الواردة إليه (الإشعارات)
        // =================================================================
        [HttpGet("teacher-requests/{teacherId}")]
        public async Task<IActionResult> GetTeacherRequests(string teacherId)
        {
            var requests = await _context.CenterTeacherLinks
                .Where(x => x.TeacherId == teacherId && x.Status == "Pending")
                .Include(x => x.Center) // لجلب اسم المركز
                .Select(x => new 
                {
                    RequestId = x.Id,
                    CenterName = x.Center.Name, 
                    Date = x.RequestDate
                })
                .ToListAsync();

            return Ok(requests);
        }

     // =================================================================
           // 3. المعلم يقبل أو يرفض الطلب
        // =================================================================
        [HttpPost("respond-request")]
        public async Task<IActionResult> RespondToRequest([FromBody] RespondDto request)
        {
            var link = await _context.CenterTeacherLinks.FindAsync(request.RequestId);
            if (link == null) return NotFound(new { message = "الطلب غير موجود" });

            // تحديث الحالة (Accepted / Rejected)
            link.Status = request.Status;
            
            await _context.SaveChangesAsync();

            return Ok(new { message = $"تم {request.Status} الطلب بنجاح" });
        }

        // =================================================================
        // 4. المركز يجلب قائمة المعلمين المقبولين فقط (لإنشاء الدورة)
        // =================================================================
        [HttpGet("my-teachers/{centerId}")]
        public async Task<IActionResult> GetMyTeachers(string centerId)
        {
            var teachers = await _context.CenterTeacherLinks
                .Where(x => x.CenterId == centerId && x.Status == "Accepted")
                .Include(x => x.Teacher)
                .Select(x => new 
                {
                    TeacherId = x.Teacher.Id,
                    FullName = $"{x.Teacher.FirstName} {x.Teacher.LastName}"
                })
                .ToListAsync();

            return Ok(teachers);
        }
   // داخل CenterStaffController.cs

// 5. البحث عن معلم موجود (بالاسم أو الهاتف)
[HttpGet("search")]
public async Task<IActionResult> SearchTeachers([FromQuery] string query)
{
    if (string.IsNullOrEmpty(query)) return BadRequest(new { message = "أدخل نصاً للبحث" });

    var teachers = await _context.Users
        .Where(u => u.UserType == "Teacher" && 
                   (u.FirstName.Contains(query) || u.LastName.Contains(query) || u.PhoneNumber.Contains(query)))
        .Select(u => new 
        { 
            u.Id, 
            FullName = $"{u.FirstName} {u.LastName}", 
            Phone = u.PhoneNumber 
        })
        .Take(5) // جلب أول 5 نتائج فقط
        .ToListAsync();

    return Ok(teachers);
}
   
   // دالة جديدة: جلب المعلمين المسجلين في مركز معين
[HttpGet("center-teachers/{id}")]
public async Task<IActionResult> GetCenterStaff(string id)
{
    // 1. الحل السحري: نبحث عن المركز سواء وصلنان رقم المدير أو رقم المركز
    // هذا يحل مشكلة الجدول الفارغ نهائياً
    var center = await _context.Centers
        .FirstOrDefaultAsync(c => c.UserId == id || c.Id == id);

    if (center == null)
    {
        return NotFound(new { message = "المركز غير موجود" });
    }

    // 2. جلب المعلمين المرتبطين بهذا المركز الحقيقي
    var teachers = await _context.CenterTeacherLinks
        .Where(x => x.CenterId == center.Id) // نستخدم ID المركز الصحيح
        .Include(x => x.Teacher) // نضمن بيانات المعلم
        .Select(x => new 
        {
            Id = x.Teacher.Id,
            FullName = x.Teacher.FirstName + " " + x.Teacher.LastName,
            Phone = x.Teacher.PhoneNumber ?? "غير متوفر",
            Status = x.Status, // (Accepted, Pending, etc.)
            Date = x.RequestDate
        })
        .ToListAsync();

    return Ok(teachers);
}
   
   // داخل ملف CenterStaffController.cs

// =================================================================
// 6. حذف معلم من كادر المركز (إلغاء الارتباط)
// =================================================================
[HttpDelete("remove-teacher/{teacherId}")]
public async Task<IActionResult> RemoveTeacher(string teacherId, [FromQuery] string centerId)
{
    // نبحث عن الرابط بين هذا المركز وهذا المعلم
    // ملاحظة: centerId سيأتينا من الـ Query String
    
    // 1. العثور على المركز الحقيقي
    var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == centerId || c.Id == centerId);
    if (center == null) return NotFound(new { message = "المركز غير موجود" });

    // 2. البحث عن العلاقة
    var link = await _context.CenterTeacherLinks
        .FirstOrDefaultAsync(x => x.CenterId == center.Id && x.TeacherId == teacherId);

    if (link == null)
    {
        return NotFound(new { message = "هذا المعلم غير موجود في قائمة مركزك" });
    }

    // 3. الحذف
    _context.CenterTeacherLinks.Remove(link);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تم حذف المعلم من كادر المركز بنجاح" });
}

   
    }
    // كلاس صغير لاستقبال البيانات
public class InviteTeacherDto
{
    public string CenterId { get; set; }
    public string TeacherId { get; set; }
}

    // DTOs
    public class InviteDto { 
        public string CenterId { get; set; } public string TeacherId { get; set; } 
        }
    public class RespondDto {
         public int RequestId { get; set; } public string Status { get; set; } 
         }
}