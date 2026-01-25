using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. تسجيل طالب في دورة جديدة
        // ==========================================
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollmentRequestDto request)
        {
            // 1. التحقق من وجود الطالب والدورة
            var studentExists = await _context.Users.AnyAsync(u => u.Id == request.StudentId);
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == request.CourseId);

            if (!studentExists || !courseExists)
                return BadRequest("بيانات الطالب أو الدورة غير صحيحة.");

            // 2. التحقق هل هو مسجل مسبقاً؟
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == request.StudentId && e.CourseId == request.CourseId);

            if (existingEnrollment != null)
                return BadRequest("الطالب مسجل بالفعل في هذه الدورة.");

            // 3. إنشاء التسجيل
            var enrollment = new Enrollment
            {
                StudentId = request.StudentId,
                CourseId = request.CourseId,
                EnrollmentDate = DateTime.UtcNow,
                Status = "Approved", // قبول فوري للتسهيل (يمكن جعله Pending)
                Progress = 0
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();
        
        
        var course = await _context.Courses.FindAsync(request.CourseId);
var student = await _context.Users.FindAsync(request.StudentId);
            if (course != null && student != null)
               {
    var notification = new Notification
    {
        UserId = course.CenterId, // نرسل الإشعار لمدير المركز صاحب الدورة
        Title = "تسجيل طالب جديد",
        Message = $"قام الطالب {student.FirstName} {student.LastName} بالتسجيل في دورة {course.Name}",
        CreatedAt = DateTime.UtcNow
    };
    _context.Notifications.Add(notification);
    await _context.SaveChangesAsync();
}
            return Ok(new { message = "تم التسجيل بنجاح!", enrollmentId = enrollment.Id });
        }






        // ==========================================
        // 2. عرض الدورات المتاحة (التي لم يسجل فيها الطالب بعد)
        // ==========================================
        [HttpGet("available/{studentId}")]
        public async Task<IActionResult> GetAvailableCourses(string studentId)
        {
            // نجلب كل الدورات
            var allCourses = await _context.Courses.ToListAsync();
            
            // نجلب الدورات التي سجل فيها الطالب
            var enrolledCourseIds = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.CourseId)
                .ToListAsync();

            // نستثني الدورات المسجلة لنعرض فقط "الجديد"
            var availableCourses = allCourses
                .Where(c => !enrolledCourseIds.Contains(c.Id))
                .ToList();

            return Ok(availableCourses);
        }
  
  // ==========================================
        // 3. إضافة بيانات تجريبية (Seed Data)
        // ==========================================
        // 👇 لاحظ أننا غيرناها إلى HttpGet لسهولة الاستخدام
        [HttpGet("seed-courses")] 
        public async Task<IActionResult> SeedCourses()
        {
            // التحقق مما إذا كانت الدورات موجودة مسبقاً
            if (!_context.Courses.Any())
            {
                var courses = new List<Course>
                {
                    new Course { 
                        Name = "التجويد المصور - المستوى الأول", 
                        Description = "شرح أحكام النون الساكنة والتنوين والمدود بطريقة مبسطة.", 
                        Level = "مبتدئ", 
                        CenterId = "1" // سنعالج مشكلة المركز بالأسفل
                    },
                    new Course { 
                        Name = "فقه العبادات", 
                        Description = "شرح كتاب الطهارة والصلاة على المذهب الشافعي.", 
                        Level = "متوسط", 
                        CenterId = "1" 
                    },
                    new Course { 
                        Name = "تفسير جزء عم", 
                        Description = "تأملات وتدبر في قصار السور.", 
                        Level = "مبتدئ", 
                        CenterId = "1" 
                    }
                };
                
                // حل سريع لمشكلة ربط المركز (إذا لم يكن لديك مراكز في القاعدة)
                // سنقوم بإنشاء مركز وهمي وربطه بالدورات
                var defaultCenter = await _context.Centers.FirstOrDefaultAsync();
                if (defaultCenter == null)
                {
                    // إذا لم يوجد أي مركز، ننشئ واحداً (اختياري حسب الـ Model تبعك)
                     // ملاحظة: إذا كان الـ Model يتطلب CenterId ولا يوجد جدول مراكز، 
                     // قد نحتاج لحذف خاصية CenterId مؤقتاً من الكود أعلاه.
                     // لكن لنجرب الحفظ، وفي حال الخطأ سنقوم بحل أبسط.
                }

                try 
                {
                    // محاولة حفظ الدورات
                    // ملاحظة: قد يحدث خطأ إذا كان CenterId غير موجود في جدول المراكز
                    // لذلك يفضل في هذه المرحلة التجريبية تعليق السطر الخاص بـ CenterId في الأعلى
                    // أو التأكد من وجود مركز بنفس الـ ID
                    
                    // الحل الأضمن للتجربة الآن: إزالة الاعتماد على المركز مؤقتاً 
                    // إذا سمحت الـ Database بذلك، أو إنشاء مركز وهمي:
                    /*
                    var center = new Center { Id = "1", Name = "مركز الوحي الرئيسي", Location = "عمان" };
                    if(!_context.Centers.Any(c => c.Id == "1")) _context.Centers.Add(center);
                    */
                    
                    _context.Courses.AddRange(courses);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "✅ تمت إضافة الدورات بنجاح! ارجع للموقع وجرب الآن." });
                }
                catch (Exception ex)
                {
                    return BadRequest(new { error = "حدث خطأ أثناء الحفظ. تأكد من وجود مراكز في القاعدة أو ألغِ ربط المركز مؤقتاً.", details = ex.Message });
                }
            }
            return Ok(new { message = "⚠️ الدورات موجودة بالفعل في قاعدة البيانات." });
        }
    }


    // DTO لاستقبال طلب التسجيل
    public class EnrollmentRequestDto
    {
        public string StudentId { get; set; }
        public string CourseId { get; set; }
    }
}