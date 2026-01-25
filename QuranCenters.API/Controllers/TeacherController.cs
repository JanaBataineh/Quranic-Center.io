using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using System.Security.Claims;

namespace QuranCenters.API.Controllers
{
    // هذا الكنترولر خاص بالمعلمين (أو المراكز) لإدارة العملية التعليمية
    [Route("api/[controller]")]
    [ApiController]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeacherController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. إدارة الامتحانات (Exams)
        // ==========================================

        // إنشاء امتحان جديد مع الأسئلة
        [HttpPost("exams")]
        public async Task<IActionResult> CreateExam([FromBody] Exam exam)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // التأكد من وجود الدورة
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == exam.CourseId);
            if (!courseExists)
                return BadRequest(new { message = "الدورة غير موجودة" });

            exam.CreatedAt = DateTime.UtcNow;
            
            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم إنشاء الامتحان بنجاح!", examId = exam.Id });
        }

        // جلب الامتحانات الخاصة بدورة معينة
        [HttpGet("exams/course/{courseId}")]
        public async Task<IActionResult> GetExamsByCourse(string courseId)
        {
            var exams = await _context.Exams
                .Where(e => e.CourseId == courseId)
                .Include(e => e.Questions) // تضمين الأسئلة
                .ToListAsync();

            return Ok(exams);
        }

        // ==========================================
        // 2. إدارة الواجبات (Assignments)
        // ==========================================

        // إنشاء واجب جديد
        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] Assignment assignment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            assignment.CreatedAt = DateTime.UtcNow;

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم نشر الواجب بنجاح!" });
        }

        // ==========================================
        // 3. سجلات التحفيظ (Hifz)
        // ==========================================

        // إضافة سجل تسميع لطالب
        [HttpPost("hifz")]
        public async Task<IActionResult> AddHifzRecord([FromBody] HifzRecord record)
        {
            // التحقق من وجود الطالب
            var studentExists = await _context.Users.AnyAsync(u => u.Id == record.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "الطالب غير موجود" });

            record.Date = DateTime.UtcNow;

            _context.HifzRecords.Add(record);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم رصد التسميع بنجاح!" });
        }

        // جلب سجلات طالب معين
        [HttpGet("hifz/student/{studentId}")]
        public async Task<IActionResult> GetStudentHifz(string studentId)
        {
            var records = await _context.HifzRecords
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.Date)
                .ToListAsync();

            return Ok(records);
        }

        // ==========================================
        // 4. مساعدات (Helpers)
        // ==========================================

        // جلب قائمة الطلاب (للاختيار منهم في صفحة التحفيظ)
        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Users
                .Where(u => u.UserType == "Student" || u.UserType == "student")
                .Select(u => new { u.Id, FullName = $"{u.FirstName} {u.LastName}", u.Email })
                .ToListAsync();

            return Ok(students);
        }
   
   // داخل ملف TeacherController.cs

// إضافة معلم جديد (بشكل سريع)
[HttpPost("add")]
public async Task<IActionResult> AddTeacher([FromBody] CreateTeacherDto dto)
{
    // 1. التحقق من البيانات
    if (string.IsNullOrEmpty(dto.FullName)) return BadRequest("الاسم مطلوب");

    // 2. إنشاء مستخدم جديد
            var newTeacher = new User 
            { 
                // توليد ID جديد تلقائياً
                Id = Guid.NewGuid().ToString(), 
                UserName = dto.Phone, // اسم المستخدم هو رقم الهاتف
                FirstName = dto.FullName.Split(' ')[0], // الاسم الأول
                LastName = dto.FullName.Contains(' ') ? dto.FullName.Substring(dto.FullName.IndexOf(' ') + 1) : "-",
                PhoneNumber = dto.Phone,
                UserType = "Teacher",
                Email = dto.Phone + "@teacher.local", // إيميل وهمي مؤقت
                PasswordHash = "Teacher123!" // كلمة مرور افتراضية (يفضل تشفيرها لاحقاً)
            };

try 
            {
                // 3. حفظه في قاعدة البيانات
                _context.Users.Add(newTeacher); 
                await _context.SaveChangesAsync();
                
                // يمكنك هنا إضافة كود لربطه بمركز إذا أردت
                // لكن حالياً سنكتفي بإنشائه

                return Ok(new { message = "تمت إضافة المعلم بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "فشل الحفظ: " + ex.Message });
            }


   
    }



// 2. دالة جلب إحصائيات المعلم
[HttpGet("dashboard-stats")]
public async Task<IActionResult> GetDashboardStats()
{
var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

    // أ) حساب محاضرات اليوم (من جدول Schedules)
    // ملاحظة: نحتاج معرفة كيف تخزنين أسماء الأيام (Sunday أم الأحد؟)
    // هنا نفترض أنك تخزنينها بالإنجليزية، سنعدلها لاحقاً إذا لزم الأمر
    var todayName = DateTime.Now.DayOfWeek.ToString(); 
    
    var todayLectures = await _context.Schedules
        .Where(s => s.TeacherId == teacherId && s.Day == todayName)
        .CountAsync();

    // ب) حساب البيانات الأخرى (سنضعها 0 مؤقتاً حتى ننشئ جداول الرسائل والواجبات)
    var stats = new TeacherDashboardStatsDto
    {
        NewMessages = 0, // لاحقاً: _context.Messages.Count(m => !m.IsRead ...)
        AttendanceRate = 95, // قيمة ثابتة مؤقتاً
        PendingAssignments = 0, // لاحقاً: _context.Assignments.Count(...)
        TodayLectures = todayLectures
    };

    return Ok(stats);
}
   

// ==========================================
// 5. جلب دورات المعلم
// ==========================================
[HttpGet("my-courses")]
public async Task<IActionResult> GetMyCourses(){
    var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

    var courses = await _context.Courses
        .Where(c => c.TeacherId == teacherId) // ✅ جلب الدورات المرتبطة بهذا المعلم
        .Select(c => new 
        {
            c.Id,
            c.Name,
            c.Level,
            CenterName = c.Center.Name, // اسم المركز
            StudentsCount = _context.Enrollments.Count(e => e.CourseId == c.Id) // عدد الطلاب
        })
        .ToListAsync();

    return Ok(courses);
}

// ==========================================
// 6. إدارة تفاصيل الدورة (الطلاب والبيانات)
// ==========================================

// جلب الطلاب المسجلين في دورة محددة
[HttpGet("course/{courseId}/students")]
public async Task<IActionResult> GetStudentsInCourse(string courseId)
{
    // نفترض وجود جدول Enrollments يربط بين الطالب والدورة
    var students = await _context.Enrollments
        .Where(e => e.CourseId == courseId)
        .Include(e => e.Student) // تضمين بيانات الطالب
        .Select(e => new 
        {
            StudentId = e.Student.Id,
            FullName = $"{e.Student.FirstName} {e.Student.LastName}",
            e.Student.Email,
            e.EnrollmentDate,
            // يمكنك إضافة حقول للدرجات هنا لاحقاً
        })
        .ToListAsync();

    return Ok(students);
}

// ==========================================
// 7. إدارة سجل الدرجات (Grades)
// ==========================================

// جلب كشف العلامات لدورة معينة
[HttpGet("course/{courseId}/grades-sheet")]
public async Task<IActionResult> GetGradesSheet(string courseId)
{
    var students = await _context.Enrollments
        .Where(e => e.CourseId == courseId)
        .Include(e => e.Student)
        .Select(e => new 
        {
            EnrollmentId = e.Id,
            StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
            StudentId = e.Student.UserName, // الرقم الجامعي
            Major = "تخصص عام", // أو أي حقل آخر من جدول الطالب
            e.Participation,
            e.Homework,
            e.Midterm,
            e.Final,
            GradeStatus = e.GradeStatus ?? "Undefined"
        })
        .ToListAsync();

    return Ok(students);
}

// حفظ تعديلات الدرجات
[HttpPost("grades/save")]
public async Task<IActionResult> SaveGrades([FromBody] List<GradeUpdateDto> grades)
{
    if (grades == null || !grades.Any())
        return BadRequest("لا توجد بيانات للحفظ");

    foreach (var item in grades)
    {
        var enrollment = await _context.Enrollments.FindAsync(item.EnrollmentId);
        if (enrollment != null)
        {
            enrollment.Participation = item.Participation;
            enrollment.Homework = item.Homework;
            enrollment.Midterm = item.Midterm;
            enrollment.Final = item.Final;
            enrollment.GradeStatus = item.GradeStatus;
        }
    }

    await _context.SaveChangesAsync();
    return Ok(new { message = "تم حفظ الدرجات بنجاح! ✅" });
}
// ==========================================
// 8. حفظ الحضور (تم التعديل لمنع التكرار في نفس اليوم)
// ==========================================
[HttpPost("attendance/save")]
public async Task<IActionResult> SaveAttendance([FromBody] List<AttendanceRecord> records)
{
    if (records == null || !records.Any())
        return BadRequest("لا توجد بيانات");

    foreach (var record in records)
    {
        // 1. تحديد بداية ونهاية اليوم الحالي لضمان البحث في نفس اليوم
        var today = DateTime.UtcNow.Date;

        // 2. البحث هل يوجد سجل لهذا الطالب في هذه الدورة في هذا اليوم؟
        var existingRecord = await _context.AttendanceRecords
            .FirstOrDefaultAsync(r => 
                r.StudentId == record.StudentId && 
                r.CourseId == record.CourseId && 
                r.Date.Date == today);

        if (existingRecord != null)
        {
            // ✅ الحالة موجودة مسبقاً -> نقوم بتحديثها فقط
            existingRecord.Status = record.Status;
            existingRecord.Date = DateTime.UtcNow; // تحديث الوقت للوقت الحالي
        }
        else
        {
            // ✅ الحالة غير موجودة -> نقوم بإنشاء سجل جديد
            record.Date = DateTime.UtcNow;
            _context.AttendanceRecords.Add(record);
        }
    }

    await _context.SaveChangesAsync();
    return Ok(new { message = "تم حفظ الحالة بنجاح" });
}
// ==========================================
// 9. جلب قائمة الطلاب مع إحصائيات الحضور
// ==========================================
[HttpGet("course/{courseId}/attendance-stats")]
public async Task<IActionResult> GetCourseAttendanceStats(string courseId)
{
    // 1. جلب جميع الطلاب المسجلين في الدورة
    var students = await _context.Enrollments
        .Where(e => e.CourseId == courseId)
        .Include(e => e.Student)
        .Select(e => new 
        { 
            e.Student.Id, 
            FullName = e.Student.FirstName + " " + e.Student.LastName, 
            UniversityId = e.Student.UserName 
        })
        .ToListAsync();

    // 2. جلب جميع سجلات الحضور لهذه الدورة دفعة واحدة
    var records = await _context.AttendanceRecords
        .Where(ar => ar.CourseId == courseId)
        .ToListAsync();

    // 3. حساب الإحصائيات لكل طالب
    var result = students.Select(s => new
    {
        StudentId = s.Id,
        s.FullName,
        s.UniversityId,
        // حساب عدد مرات كل حالة
        PresentCount = records.Count(r => r.StudentId == s.Id && r.Status == "Present"),
        AbsentCount = records.Count(r => r.StudentId == s.Id && r.Status == "Absent"),
        LateCount = records.Count(r => r.StudentId == s.Id && r.Status == "Late")
    });

    return Ok(result);
}


// ==========================================
// 10. جلب تفاصيل طالب محدد في دورة (علامات + حضور)
// ==========================================
[HttpGet("course/{courseId}/student/{studentId}/details")]
public async Task<IActionResult> GetStudentDetails(string courseId, string studentId)
{
    // 1. جلب بيانات التسجيل (العلامات)
    var enrollment = await _context.Enrollments
        .Include(e => e.Student)
        .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

    if (enrollment == null) return NotFound("الطالب غير مسجل في هذه الدورة");

    // 2. جلب سجلات الحضور
    var attendanceRecords = await _context.AttendanceRecords
        .Where(a => a.CourseId == courseId && a.StudentId == studentId)
        .ToListAsync();

    // 3. تجميع البيانات
    var result = new
    {
        StudentName = $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
        StudentId = enrollment.Student.UserName,
        EnrollmentDate = enrollment.EnrollmentDate,
        
        // العلامات
        Grades = new
        {
            enrollment.Participation,
            enrollment.Homework,
            enrollment.Midterm,
            enrollment.Final,
            Total = enrollment.Participation + enrollment.Homework + enrollment.Midterm + enrollment.Final,
            Status = enrollment.GradeStatus ?? "Undefined"
        },

        // إحصائيات الحضور
        Attendance = new
        {
            Present = attendanceRecords.Count(a => a.Status == "Present"),
            Absent = attendanceRecords.Count(a => a.Status == "Absent"),
            Late = attendanceRecords.Count(a => a.Status == "Late")
        }
    };

    return Ok(result);
}

// ==========================================
// 11. حذف طالب من الدورة
// ==========================================
[HttpDelete("course/{courseId}/student/{studentId}")]
public async Task<IActionResult> RemoveStudentFromCourse(string courseId, string studentId)
{
    // البحث عن سجل التسجيل (Enrollment) الذي يربط الطالب بهذه الدورة
    var enrollment = await _context.Enrollments
        .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

    if (enrollment == null)
    {
        return NotFound(new { message = "الطالب غير مسجل في هذه الدورة" });
    }
    var attendanceRecords = _context.AttendanceRecords
        .Where(a => a.CourseId == courseId && a.StudentId == studentId);
    
    _context.AttendanceRecords.RemoveRange(attendanceRecords);

    _context.Enrollments.Remove(enrollment);
       
    await _context.SaveChangesAsync();

    return Ok(new { message = "تم حذف الطالب من الدورة بنجاح" });
}
// ==========================================
// جلب كافة الواجبات الخاصة بالمعلم (لتعبئة القائمة المنسدلة)
// ==========================================
[HttpGet("assignments")]
public async Task<IActionResult> GetAllTeacherAssignments()
{
    // الحصول على معرف المعلم الحالي من التوكن
    var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

    var assignments = await _context.Assignments
        .Where(a => a.Course.TeacherId == teacherId) // جلب الواجبات المرتبطة بدورات هذا المعلم
        .Include(a => a.Course)
        .Select(a => new 
        {
            a.Id,
            a.Title,
            CourseName = a.Course.Name,
            a.DueDate
        })
        .OrderByDescending(a => a.DueDate)
        .ToListAsync();

    return Ok(assignments);
}

// ==========================================
// 12. تصحيح الواجبات (Grading)
// ==========================================


// 1. جلب تفاصيل التسليم للتصحيح
[HttpGet("submission/{submissionId}")]
public async Task<IActionResult> GetSubmissionForGrading(int submissionId)
{

    var mockData = new 
    {
        Id = submissionId,
        StudentName = "علي سامي",
        StudentId = "202110450",
        SubmissionDate = DateTime.Now.AddHours(-2),
        FileName = "Project_Report.pdf",
        FilePath = "/uploads/Project_Report.pdf", // رابط افتراضي
        MaxGrade = 10,
        CurrentGrade = 0, // الدرجة الحالية (0 اذا لم يصحح)
        Feedback = ""
    };

    return Ok(mockData);
}

// ==========================================
// 13. إنشاء واجب جديد (مع رفع ملف) - متوافق مع المودل الحالي
// ==========================================
[HttpPost("assignment/create")]
public async Task<IActionResult> CreateAssignment([FromForm] CreateAssignmentDto model)
{
    // إنشاء كائن الواجب
    var assignment = new Assignment
    {
        Title = model.Title,
        Description = model.Description,
        DueDate = model.DueDate,
        CourseId = model.CourseId
        // Id يتم إنشاؤه تلقائياً حسب المودل الخاص بك
    };

    // معالجة رفع الملف (إذا وجد)
    if (model.File != null && model.File.Length > 0)
    {
        // مجلد الحفظ: wwwroot/uploads/assignments
        var folderName = Path.Combine("wwwroot", "uploads", "assignments");
        var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);

        if (!Directory.Exists(pathToSave))
            Directory.CreateDirectory(pathToSave);

        // توليد اسم فريد للملِّف
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(model.File.FileName);
        var fullPath = Path.Combine(pathToSave, fileName);
        
        // المسار الذي سيخزن في الداتا بيز (نسبي)
        var dbPath = Path.Combine("uploads", "assignments", fileName).Replace("\\", "/");

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await model.File.CopyToAsync(stream);
        }

        assignment.AttachmentPath = dbPath;
    }

    _context.Assignments.Add(assignment);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تم نشر الواجب بنجاح! ✅" });
}

// ==========================================
// جلب إحصائيات الدورة (عدد الطلاب، الامتحانات، الواجبات)
// ==========================================
[HttpGet("course/{courseId}/stats")]
public async Task<IActionResult> GetCourseStats(string courseId)
{
    var stats = new
    {
        // حساب عدد الطلاب
        students = await _context.Enrollments.CountAsync(e => e.CourseId == courseId),
        
        // حساب عدد الامتحانات
        exams = await _context.Exams.CountAsync(e => e.CourseId == courseId),
        
        // حساب عدد الواجبات (وهذا هو المهم لك)
        assignments = await _context.Assignments.CountAsync(a => a.CourseId == courseId)
    };

    return Ok(stats);
}


// [داخل TeacherController.cs]

// ==========================================
// 15. جلب تسليمات الطلاب لواجب معين
// ==========================================
[HttpGet("assignment/{assignmentId}/submissions")]
public async Task<IActionResult> GetAssignmentSubmissions(string assignmentId)
{
    var submissions = await _context.AssignmentSubmissions
        .Where(s => s.AssignmentId == assignmentId)
        .Include(s => s.Student) // لجلب اسم الطالب
        .Select(s => new
        {
            s.Id,
            StudentName = s.Student.FirstName + " " + s.Student.LastName,
            s.SubmissionDate,
            s.FilePath,
            s.Notes, // ملاحظات الطالب
            s.IsGraded,
            s.Grade,
            s.TeacherFeedback
        })
        .OrderByDescending(s => s.SubmissionDate)
        .ToListAsync();

    return Ok(submissions);
}

// ==========================================
// 16. رصد الدرجة والملاحظات (تصحيح الواجب)
// ==========================================
[HttpPost("submission/grade")]
public async Task<IActionResult> GradeSubmission([FromBody] GradeSubmissionDto dto)
{
    var submission = await _context.AssignmentSubmissions.FindAsync(dto.SubmissionId);
    if (submission == null) return NotFound("التسليم غير موجود");

    submission.Grade = dto.Grade;
    submission.TeacherFeedback = dto.Feedback;
    submission.IsGraded = true;

    await _context.SaveChangesAsync();
    return Ok(new { message = "تم رصد الدرجة بنجاح ✅" });
}


// [داخل TeacherController.cs]

// ==========================================
// 18. جلب الواجبات الخاصة بدورة معينة فقط (للقائمة المتسلسلة)
// ==========================================
[HttpGet("course/{courseId}/assignments")]
public async Task<IActionResult> GetAssignmentsByCourse(string courseId)
{
    var assignments = await _context.Assignments
        .Where(a => a.CourseId == courseId)
        .Select(a => new 
        {
            a.Id,
            a.Title,
            a.DueDate
        })
        .OrderByDescending(a => a.DueDate)
        .ToListAsync();

    return Ok(assignments);
}



// DTO
public class GradeSubmissionDto
{
    public int SubmissionId { get; set; }
    public int Grade { get; set; }
    public string? Feedback { get; set; }
}

    }
        public class CreateTeacherDto 
{
    public string FullName { get; set; }
    public string Specialty { get; set; }
    public string Phone { get; set; }
    public string CenterId { get; set; }

}


// 1. كلاس صغير لنقل البيانات (DTO)
public class TeacherDashboardStatsDto
{
    public int NewMessages { get; set; }
    public int AttendanceRate { get; set; }
    public int PendingAssignments { get; set; }
    public int TodayLectures { get; set; }
}

public class GradeUpdateDto
{
    public string EnrollmentId { get; set; } // تأكد أن النوع string لأننا عرفناه string في المودل
    public double Participation { get; set; }
    public double Homework { get; set; }
    public double Midterm { get; set; }
    public double Final { get; set; }
    public string GradeStatus { get; set; }

}
public class CreateAssignmentDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime DueDate { get; set; }
    public string CourseId { get; set; }
    public IFormFile? File { get; set; } // لاستقبال الملف من الفرونت إند
}
// نموذج لاستقبال الدرجة
public class GradeSubmissionDto
{
    public int SubmissionId { get; set; }
    public double Grade { get; set; }
    public string Feedback { get; set; }
}

}