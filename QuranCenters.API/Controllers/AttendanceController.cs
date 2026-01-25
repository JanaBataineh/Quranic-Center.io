using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب ورقة التحضير (الطلاب + حالتهم في هذا اليوم)
        [HttpGet("sheet")]
        public async Task<IActionResult> GetAttendanceSheet([FromQuery] string courseId, [FromQuery] DateTime date)
        {
            // أ. جلب جميع المسجلين في الدورة
            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseId == courseId && (e.Status == "active" || e.Status == "approved"))
                .ToListAsync();

            // ب. جلب الحضور المسجل لهذا اليوم (إن وجد)
            var existingAttendance = await _context.Attendances
                .Where(a => a.CourseId == courseId && a.Date.Date == date.Date)
                .ToListAsync();

            // ج. دمج البيانات
            var sheet = enrollments.Select(e => {
                var record = existingAttendance.FirstOrDefault(a => a.EnrollmentId == e.Id);
                return new 
                {
                    EnrollmentId = e.Id,
                    StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
                    // إذا وجد سجل نأخذ قيمته، وإلا نعتبره "حاضر" افتراضياً
                    Status = record?.Status ?? "present", 
                    Notes = record?.Notes ?? "",
                    Rating = record?.Rating ?? 0,
                    IsNew = record == null // هل هذا سجل جديد أم تعديل؟
                };
            });

            return Ok(sheet);
        }

        // 2. حفظ القائمة كاملة (Batch Save)
        [HttpPost("save")]
        public async Task<IActionResult> SaveAttendance([FromBody] AttendanceBatchDto model)
        {
            foreach (var item in model.Records)
            {
                // البحث عن سجل موجود لتحديثه
                var existing = await _context.Attendances
                    .FirstOrDefaultAsync(a => a.EnrollmentId == item.EnrollmentId && a.Date.Date == model.Date.Date);

                if (existing != null)
                {
                    // تحديث
                    existing.Status = item.Status;
                    existing.Notes = item.Notes;
                    existing.Rating = item.Rating;
                }
                else
                {
                    // إضافة جديد
                    _context.Attendances.Add(new Attendance
                    {
                        CourseId = model.CourseId,
                        EnrollmentId = item.EnrollmentId,
                        Date = model.Date,
                        Status = item.Status,
                        Notes = item.Notes,
                        Rating = item.Rating
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حفظ سجل الحضور بنجاح" });
        }
    }

    // DTOs مساعدة
    public class AttendanceBatchDto
    {
        public string CourseId { get; set; }
        public DateTime Date { get; set; }
        public List<AttendanceRecordDto> Records { get; set; }
    }

    public class AttendanceRecordDto
    {
        public string EnrollmentId { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public int Rating { get; set; }
    }
}