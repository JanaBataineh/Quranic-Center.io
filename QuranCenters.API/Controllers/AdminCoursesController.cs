using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models; // ضروري عشان يتعرف على Course
using System.ComponentModel.DataAnnotations; // ضروري عشان يتعرف على [Required]
namespace QuranCenters.API.Controllers
{
    [Route("api/admin/courses")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminCoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AdminCoursesController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _context.Courses
                .Include(c => c.Center)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    CenterName = c.Center.Name,
                    c.Level,
                    Price = c.Price, // أو الحقل الفعلي في قاعدة بياناتك
                    Status = c.Status
                }).ToListAsync();
            return Ok(courses);
        }
    
    // 2. جلب دورة واحدة للتعديل (GET by ID)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();
            return Ok(course);
        }



// 3. إضافة دورة جديدة (POST) - نسخة معدلة لكشف الأخطاء
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCourseDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var course = new Course
                {
                    Name = dto.Name,
                    CenterId = dto.CenterId,
                    Level = dto.Level,
                    Price = dto.Price,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    Description = "" // قيمة افتراضية
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تمت إضافة الدورة بنجاح", id = course.Id });
            }
            catch (Exception ex)
            {
                // هذا السطر سيرسل تفاصيل الخطأ الحقيقي للمتصفح
                return StatusCode(500, new { message = "خطأ في السيرفر: " + ex.Message + (ex.InnerException != null ? " | التفاصيل: " + ex.InnerException.Message : "") });
            }
        }
        // 4. تعديل دورة (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateCourseDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            course.Name = dto.Name;
            course.CenterId = dto.CenterId;
            course.Level = dto.Level;
            course.Price = dto.Price;
            // لا نغير الحالة هنا (Status) إلا إذا أردت ذلك

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تعديل الدورة بنجاح" });
        }

[HttpDelete("{id}")]
public async Task<IActionResult> DeleteCourse(string id)
{
    var course = await _context.Courses.FindAsync(id);
    if (course == null) return NotFound();

    // 1. حذف جميع تسجيلات الطلاب في هذه الدورة
    var enrollments = await _context.Enrollments.Where(e => e.CourseId == id).ToListAsync();
    if (enrollments.Any())
    {
        _context.Enrollments.RemoveRange(enrollments);
    }

    // 2. حذف الجداول الدراسية المرتبطة بهذه الدورة
    var schedules = await _context.Schedules.Where(s => s.CourseId == id).ToListAsync();
    if (schedules.Any())
    {
        _context.Schedules.RemoveRange(schedules);
    }

    // 3. حذف الامتحانات والواجبات (إن وجدت)
    var exams = await _context.Exams.Where(x => x.CourseId == id).ToListAsync();
    if (exams.Any()) _context.Exams.RemoveRange(exams);

    var assignments = await _context.Assignments.Where(a => a.CourseId == id).ToListAsync();
    if (assignments.Any()) _context.Assignments.RemoveRange(assignments);

    // 4. أخيراً.. حذف الدورة نفسها
    _context.Courses.Remove(course);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تم حذف الدورة وجميع ارتباطاتها بنجاح" });
} 
 

// 6. اعتماد دورة (تغيير الحالة إلى published)
[HttpPut("{id}/approve")]
public async Task<IActionResult> ApproveCourse(string id)
{
    var course = await _context.Courses.FindAsync(id);
    if (course == null) return NotFound();

    // تغيير الحالة لتتوافق مع الشرط الموجود في الجافاسكربت لإظهار الشارة الخضراء
    course.Status = "published"; 

    await _context.SaveChangesAsync();
    return Ok(new { message = "تم اعتماد الدورة بنجاح" });
}

// داخل AdminCoursesController.cs

// 7. إلغاء اعتماد دورة (إعادتها لحالة pending)
[HttpPut("{id}/revoke")]
public async Task<IActionResult> RevokeCourse(string id)
{
    var course = await _context.Courses.FindAsync(id);
    if (course == null) return NotFound();

    course.Status = "pending"; // إعادة الحالة إلى معلق

    await _context.SaveChangesAsync();
    return Ok(new { message = "تم إلغاء الاعتماد بنجاح" });
}

}
    // كلاس بسيط لاستقبال البيانات (DTO)
    public class CreateCourseDto
    {
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string CenterId { get; set; }
        
        [Required]
        public string Level { get; set; }
        
        [Required]
        public decimal Price { get; set; }
    }

}