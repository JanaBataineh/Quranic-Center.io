using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب ملخص التقارير (Dashboard Stats)
        [HttpGet("summary/{centerId}")]
        public async Task<IActionResult> GetReportsSummary(string centerId)
        {
            // أ. حساب نسب الحضور (من جدول الحضور)
            var totalAttendanceRecords = await _context.Attendances
                .Include(a => a.Enrollment)
                .ThenInclude(e => e.Course)
                .Where(a => a.Enrollment.Course.CenterId == centerId)
                .CountAsync();

            var presentCount = await _context.Attendances
                .Include(a => a.Enrollment)
                .ThenInclude(e => e.Course)
                .Where(a => a.Enrollment.Course.CenterId == centerId && a.Status == "present")
                .CountAsync();

            var absentCount = await _context.Attendances
                .Include(a => a.Enrollment)
                .ThenInclude(e => e.Course)
                .Where(a => a.Enrollment.Course.CenterId == centerId && a.Status == "absent")
                .CountAsync();

            double attendanceRate = totalAttendanceRecords > 0 ? (double)presentCount / totalAttendanceRecords * 100 : 0;
            double absenceRate = totalAttendanceRecords > 0 ? (double)absentCount / totalAttendanceRecords * 100 : 0;

            // ب. الدورات الأكثر طلباً (Top 3 Courses)
            var topCourses = await _context.Courses
                .Where(c => c.CenterId == centerId)
                .Select(c => new
                {
                    Name = c.Name,
                    StudentCount = _context.Enrollments.Count(e => e.CourseId == c.Id)
                })
                .OrderByDescending(c => c.StudentCount)
                .Take(3)
                .ToListAsync();

            // ج. تجهيز النتيجة النهائية
            var result = new
            {
                AttendanceRate = Math.Round(attendanceRate, 1),
                AbsenceRate = Math.Round(absenceRate, 1),
                DropoutRate = 0, // يمكن حسابها لاحقاً إذا أضفت حالة "منسحب"
                TopCourses = topCourses
            };

            return Ok(result);
        }
    }
}