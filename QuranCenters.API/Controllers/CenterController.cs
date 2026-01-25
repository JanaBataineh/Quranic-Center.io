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

            var center = _context.Centers.FirstOrDefault(c => c.UserId == userId);

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
[HttpPost("courses/add")]
public async Task<IActionResult> CreateCourse([FromBody] CourseDto courseDto)
{
    try{
    if (!ModelState.IsValid) 
    return BadRequest(ModelState);

    // 🌟 التعديل: نأخذ الآيدي من التوكن لضمان الحماية بدلاً من البدي
    var centerId = GetCenterIdFromToken();
    if (centerId == null) return Unauthorized();
string? teacherIdToSave = null;

        // إذا تم اختيار معلم، نتأكد أنه موجود فعلاً في قاعدة البيانات
        if (!string.IsNullOrEmpty(courseDto.TeacherId))
        {
            var teacherExists = await _context.Users.AnyAsync(u => u.Id == courseDto.TeacherId);
            if (!teacherExists)
            {
                // هنا نمنع الخطأ 500 ونرجع رسالة واضحة
                return BadRequest(new { message = "خطأ: المعلم المختار غير موجود في النظام!" });
            }
            teacherIdToSave = courseDto.TeacherId;
        }
    var newCourse = new Course
    {
        Id = Guid.NewGuid().ToString(),
        Name = courseDto.Name,
        Level = courseDto.Level,
        Price = courseDto.Price,
        CenterId = centerId, // ✅ استخدام الآيدي المستخرج من التوكن
        Status = "pending",
        Description = "لا يوجد وصف لهذه الدورة حالياً",
        CreatedAt = DateTime.UtcNow,
TeacherId = teacherIdToSave
    };

    _context.Courses.Add(newCourse);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تمت إضافة الدورة بنجاح، وهي بانتظار موافقة الأدمن.", course = newCourse });
    }catch (Exception ex)
    {
        // طباعة الخطأ في الكونسول (Backend Console)
        Console.WriteLine($"🔥🔥 Error in CreateCourse: {ex.Message}");
        
        // محاولة جلب الخطأ الداخلي (الأكثر دقة)
        var innerMessage = ex.InnerException?.Message ?? "No details";
        
        // إرجاع الخطأ للمتصفح بصيغة JSON
        return StatusCode(500, new { 
            message = "فشل حفظ الدورة في قاعدة البيانات", 
            error = ex.Message, 
            details = innerMessage 
        });
    }
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
            if (course.CenterId != centerId)
            {
                return StatusCode(403, new { message = "لا تملك الصلاحية لحذف دورة لا تخص مركزك." });
            }
try 
    {
        var enrollments = _context.Enrollments.Where(e => e.CourseId == id);
        _context.Enrollments.RemoveRange(enrollments);
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"تم حذف الدورة \"{course.Name}\" وجميع سجلاتها بنجاح." });
    }
    catch (Exception ex)
    {
        // طباعة الخطأ في الكونسول لمعرفته في حال فشل الحذف
        Console.WriteLine(ex.Message);
        return StatusCode(500, new { message = "حدث خطأ أثناء الحذف من قاعدة البيانات", error = ex.Message });
    }
        }
   
  // GET: api/Center/courses/{userId}
[HttpGet("my-courses/{userId}")]
public async Task<IActionResult> GetCenterCourses(string userId)
{
    // 1. العثور على المركز أولاً باستخدام UserId
    var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
    
    if (center == null)
    {
        return NotFound(new { message = "المركز غير موجود" });
    }

    // 2. جلب قائمة الدورات التابعة لهذا المركز فقط
    var courses = await _context.Courses
        .Where(c => c.CenterId == center.Id)
        .Select(c => new {
            c.Id,
            c.Name,
            c.Level,
            c.Price,
            c.Status,
            // يمكنك إضافة عدد الطلاب المسجلين في كل دورة هنا
            studentsCount = _context.Enrollments.Count(e => e.CourseId == c.Id)
        })
        .ToListAsync();

    return Ok(courses);
}
  
  
        // GET: api/Center/dashboard-stats/{centerId}
// GET: api/Center/dashboard-stats/{centerId}
[HttpGet("dashboard-stats/{centerId}")]
public async Task<IActionResult> GetDashboardStats(string centerId)
{
    // استخدام Try-Catch لمنع انهيار السيرفر
    try
    {
        Console.WriteLine($"--- جاري البحث عن المركز للمستخدم: [{centerId}] ---");

        // 1. التحقق من المدخلات
        if (string.IsNullOrEmpty(centerId))
            return BadRequest(new { message = "رقم المعرف فارغ" });

        // 2. البحث عن المركز (الكود المصحح)
        // تمت إزالة .ToString() التي كانت تسبب المشكلة
        var center = await _context.Centers
            .FirstOrDefaultAsync(c => c.UserId == centerId);

        // إذا لم يتم العثور على المركز
        if (center == null)
        {
            Console.WriteLine("لم يتم العثور على المركز. المعرفات المتاحة:");
            var allIds = await _context.Centers.Select(c => c.UserId).ToListAsync();
            allIds.ForEach(id => Console.WriteLine($"ID: [{id}]"));
            
            return NotFound(new { message = "المركز غير موجود" });
        }

        // 3. حساب الإحصائيات
        var studentsCount = await _context.Enrollments
            .CountAsync(e => e.Course != null && e.Course.CenterId == center.Id);

        var coursesCount = await _context.Courses
            .CountAsync(c => c.CenterId == center.Id);

        var teachersCount = await _context.CenterTeacherLinks
            .CountAsync(l => l.CenterId == center.Id && l.Status == "Accepted");

        // 4. جلب الطلاب الجدد
        var recentStudents = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => e.Course.CenterId == center.Id)
            .OrderByDescending(e => e.EnrollmentDate)
            .Take(5)
            .Select(e => new 
            {
                studentName = e.Student.FirstName + " " + e.Student.LastName,
                courseName = e.Course.Name,
                date = e.EnrollmentDate.ToString("yyyy-MM-dd"),
                status = e.Status
            })
            .ToListAsync();

        var stats = new
        {
            studentsCount,
            coursesCount,
            teachersCount,
            recentStudents
        };

        return Ok(stats);
    }
    catch (Exception ex)
    {
        // طباعة الخطأ في الكونسول للمساعدة في الحل
        Console.WriteLine($"Error in DashboardStats: {ex.Message}");
        return StatusCode(500, new { message = "حدث خطأ داخلي في السيرفر", error = ex.Message });
    }
}

// GET: api/Center/profile/{userId}
[HttpGet("profile/{userId}")]
public async Task<IActionResult> GetProfile(string userId)
{
    // البحث عن المركز المرتبط بالـ UserId الذي سجل الدخول
    var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);

    if (center == null)
    {
        return NotFound(new { message = "بيانات الملف الشخصي غير موجودة" });
    }

    // إرجاع بيانات المركز (الاسم، المدينة، العنوان، إلخ)
    return Ok(center);
}

[HttpGet("students/{userId}")]
public async Task<IActionResult> GetStudents(string userId, [FromQuery] string? name, [FromQuery] string? courseId, [FromQuery] string? status)
{
    // 1. العثور على المركز
    var center = await _context.Centers.FirstOrDefaultAsync(c => c.UserId == userId);
    if (center == null)
    {
        // محاولة إضافية للبحث
        var potentialCenter = await _context.Centers.FindAsync(userId);
        if (potentialCenter != null) center = potentialCenter;
        else return NotFound(new { message = "المركز غير موجود" });
    }

    // 2. الاستعلام
    var query = _context.Enrollments
        .Include(e => e.Student)
        .Include(e => e.Course)
        .Where(e => e.Course.CenterId == center.Id)
        .AsQueryable();

    // 3. الفلترة
    if (!string.IsNullOrEmpty(name))
    {
        // ✅ تصحيح: البحث في الاسم الأول أو الأخير
        query = query.Where(e => e.Student.FirstName.Contains(name) || e.Student.LastName.Contains(name));
    }

    if (!string.IsNullOrEmpty(courseId) && courseId != "all")
        query = query.Where(e => e.CourseId == courseId);

    if (!string.IsNullOrEmpty(status) && status != "all")
        query = query.Where(e => e.Status == status);

    // 4. جلب النتائج (تم تصحيح الأخطاء هنا)
    var students = await query
        .Select(e => new 
        {
            EnrollmentId = e.Id,
            
            // ✅ تصحيح خطأ FullName: دمج الاسم الأول والأخير
            StudentName = e.Student.FirstName + " " + e.Student.LastName, 
            
            Phone = e.Student.PhoneNumber ?? "غير متوفر", // التعامل مع القيم الفارغة
            CourseName = e.Course.Name,
            
            // ✅ تصحيح خطأ RequestDate: استخدام EnrollmentDate
            Date = e.EnrollmentDate.ToString("yyyy-MM-dd"), 
            
            Status = e.Status
        })
        .ToListAsync();

    return Ok(students);
}



// 2. دالة تعديل الحالة (PUT)
[HttpPut("enrollments/{id}/status")]
public async Task<IActionResult> UpdateEnrollmentStatus(int id, [FromBody] UpdateStatusDto dto)
{
    // البحث عن التسجيل
    var enrollment = await _context.Enrollments.FindAsync(id);

    if (enrollment == null)
    {
        return NotFound(new { message = "طلب التسجيل غير موجود" });
    }

    // التحقق من أن المركز يملك الصلاحية (اختياري لكن مفضل)
    // var centerId = GetCenterIdFromToken();
    // var course = await _context.Courses.FindAsync(enrollment.CourseId);
    // if(course.CenterId != centerId) return Unauthorized();

    // تحديث الحالة
    if (string.IsNullOrEmpty(dto.Status))
{
    return BadRequest(new { message = "لا يمكن أن تكون الحالة فارغة" });
}
    enrollment.Status = dto.Status;
    
    // حفظ التغييرات
    await _context.SaveChangesAsync();

    return Ok(new { message = $"تم تغيير الحالة إلى {dto.Status} بنجاح" });
}
  
  
[AllowAnonymous]
[HttpGet("all")]
public async Task<IActionResult> GetAllCenters()
{
    try
    {
        var centers = await _context.Centers
            .Include(c => c.User) // نحتاج هذا لجلب رقم الهاتف من جدول المستخدم
            .Select(c => new 
            {
                c.Id,
                c.Name,
                Description = c.Description ?? "لا يوجد وصف",
                Location = c.Location ?? "غير محدد",
                Logo = c.Logo ?? "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(c.Name) + "&background=random&color=fff&size=128",               
                Phone = c.User != null ? c.User.PhoneNumber : "غير متوفر",                
                Manager = c.User != null ? (c.User.FirstName + " " + c.User.LastName) : "غير معروف"
            })
            .ToListAsync();

        return Ok(centers);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ أثناء جلب المراكز", error = ex.Message });
    }
}
  
  
    }







// 1. كلاس صغير لاستقبال الحالة (يمكنك وضعه في نفس الملف في الأسفل أو في ملف DTOs)
public class UpdateStatusDto
{
    public string? Status { get; set; }
}


}
