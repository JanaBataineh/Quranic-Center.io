using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.DTOs;
using QuranCenters.API.Models;
using System.Security.Claims;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 حماية: يتطلب تسجيل دخول
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب الملف الشخصي للطالب
        // GET: api/Student/profile
        [HttpGet("profile")]
        public async Task<ActionResult<StudentProfileDto>> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var student = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new StudentProfileDto
                {
                    Email = u.Email,
                    FullName = $"{u.FirstName} {u.MiddleName} {u.LastName}",
                    FirstName = u.FirstName,
                    NotificationsCount = 0 
                })
                .FirstOrDefaultAsync();

            if (student == null) return NotFound();

            return Ok(student);
        }

        // 2. جلب دورات الطالب المسجلة
        // GET: api/Student/my-courses
        [HttpGet("my-courses")]
        public async Task<ActionResult<List<StudentCourseDto>>> GetMyCourses()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // استعلام يربط جدول التسجيلات بالدورات والمراكز
            var courses = await _context.Enrollments
                .Where(e => e.StudentId == userId)
                .Include(e => e.Course)
                .ThenInclude(c => c.Center)
                .Select(e => new StudentCourseDto
                {
                    CourseId = e.Course.Id,
                    CourseName = e.Course.Name,
                    CenterName = e.Course.Center.Name,
                    Status = e.Status,
                    Progress = e.Progress
                })
                .ToListAsync();

            return Ok(courses);
        }

        // 3. تسجيل الطالب في دورة جديدة
        // POST: api/Student/enroll/{courseId}
        [HttpPost("enroll/{courseId}")]
        public async Task<IActionResult> EnrollInCourse(string courseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // أ. التحقق من وجود الدورة
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                return NotFound(new { message = "الدورة غير موجودة." });

            // ب. التحقق من عدم التسجيل المسبق (لمنع التكرار)
            var alreadyEnrolled = await _context.Enrollments
                .AnyAsync(e => e.StudentId == userId && e.CourseId == courseId);
            
            if (alreadyEnrolled)
                return Conflict(new { message = "أنت مسجل بالفعل في هذه الدورة." });

            // ج. إنشاء سجل جديد في جدول Enrollments
            var enrollment = new Enrollment
            {
                StudentId = userId,
                CourseId = courseId,
                EnrollmentDate = DateTime.Now,
                Status = "Active",
                Progress = 0
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم التسجيل في الدورة بنجاح!" });
        }
    }
}