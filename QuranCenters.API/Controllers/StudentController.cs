using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. عرض المواد (الدورات) الخاصة بالطالب
        // ==========================================
        [HttpGet("my-courses/{studentId}")]
        public async Task<IActionResult> GetStudentCourses(string studentId)
        {
            // في الوضع الحقيقي نستخدم Enrollments، لكن للتسهيل الآن سنجلب كل الدورات
            // أو يمكنك جلب الدورات التي الطالب مسجل فيها فقط إذا كان لديك بيانات تسجيل
     var myCourses = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Include(e => e.Course) // نجلب تفاصيل الدورة عبر العلاقة
                .ThenInclude(c => c.Center) // 👈 إضافة هامة: لجلب بيانات المركز صاحب الدورة
                .Select(e => new 
                {
                    e.Course.Id,
                    e.Course.Name,
                    e.Course.Description,
                    Progress = e.Progress, // نسبة الإنجاز من جدول التسجيل
                    Status = e.Status,
                    CenterName = e.Course.Center.Name
                })
                .ToListAsync();

            return Ok(myCourses);
        }

        // ==========================================
        // 2. عرض الامتحانات المتاحة في مادة معينة
        // ==========================================
        [HttpGet("exams/course/{courseId}")]
        public async Task<IActionResult> GetExamsForCourse(string courseId)
        {
            var exams = await _context.Exams
                .Where(e => e.CourseId == courseId && e.Status == "Published") // فقط المنشورة
                .Select(e => new 
                { 
                    e.Id, 
                    e.Title, 
                    e.DurationMinutes, 
                    QuestionCount = e.Questions.Count 
                })
                .ToListAsync();

            return Ok(exams);
        }

        // ==========================================
        // 3. بدء الامتحان (جلب الأسئلة)
        // ==========================================
        [HttpGet("exam/{examId}/take")]
        public async Task<IActionResult> GetExamQuestions(string examId)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                .FirstOrDefaultAsync(e => e.Id == examId);

            if (exam == null) return NotFound(new { message = "الامتحان غير موجود" });

            // نخفي الإجابة الصحيحة عن الطالب!
            var questionsForStudent = exam.Questions.Select(q => new
            {
                q.Id,
                q.Text,
                q.Type,
                q.Options, // الخيارات كما هي (نص مفصول بفواصل)
                q.Points
            });

            return Ok(new { 
                examId = exam.Id,
                title = exam.Title,
                duration = exam.DurationMinutes,
                questions = questionsForStudent 
            });
        }

        // ==========================================
        // 4. تسليم الامتحان (التصحيح الفوري)
        // ==========================================
        [HttpPost("exam/submit")]
        public async Task<IActionResult> SubmitExam([FromBody] ExamSubmissionDto submission)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                .FirstOrDefaultAsync(e => e.Id == submission.ExamId);

            if (exam == null) return NotFound("الامتحان غير موجود");

            int score = 0;
            int totalPoints = 0;

            foreach (var answer in submission.Answers)
            {
                var question = exam.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question != null)
                {
                    totalPoints += question.Points;
                    // مقارنة الإجابة (نتجاهل المسافات وحالة الأحرف)
                    if (string.Equals(question.CorrectAnswer?.Trim(), answer.SelectedAnswer?.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        score += question.Points;
                    }
                }
            }

            // هنا يمكننا حفظ النتيجة في قاعدة البيانات لاحقاً
            // حالياً سنرجع النتيجة للطالب فوراً
            return Ok(new { 
                Message = "تم تسليم الامتحان بنجاح!", 
                Score = score, 
                Total = totalPoints,
                Percentage = totalPoints > 0 ? (score * 100 / totalPoints) : 0
            });
        }
   
        // ==========================================
        // 5. جلب كل الامتحانات المنشورة (جديد وحصري)
        // ==========================================
        [HttpGet("all-exams")]
        public async Task<IActionResult> GetAllPublishedExams()
        {
            var exams = await _context.Exams
                .Include(e => e.Course) // لجلب اسم المادة
                .Where(e => e.Status == "Published") // شرط أن يكون منشوراً
                .Select(e => new 
                { 
                    e.Id, 
                    e.Title, 
                    e.DurationMinutes, 
                    QuestionCount = e.Questions.Count,
                    CourseName = e.Course != null ? e.Course.Name : "مادة عامة"
                })
                .ToListAsync();

            return Ok(exams);
        }

// ==========================================
// 6. جلب كشف العلامات (Transcript)
// ==========================================
[HttpGet("grades/{studentId}")]
public async Task<IActionResult> GetStudentGrades(string studentId)
{
    var grades = await _context.Enrollments
        .Where(e => e.StudentId == studentId)
        .Include(e => e.Course)
        .Select(e => new 
        {
            CourseCode = "CR-" + e.Course.Id.Substring(0, 4).ToUpper(), // توليد رقم مادة وهمي للعرض
            CourseName = e.Course.Name,
            e.Participation, // 10
            e.Homework,      // 20
            e.Midterm,       // 30
            e.Final,         // 40
            // حساب المجموع الكلي
            Total = e.Participation + e.Homework + e.Midterm + e.Final,
            GradeStatus = e.GradeStatus ?? "Undefined"
        })
        .ToListAsync();

    return Ok(grades);
}
   



// [داخل StudentController.cs]

// ==========================================
// 7. جلب الواجبات مع حالتها (للوحة كانبان)
// ==========================================
[HttpGet("assignments-kanban/{studentId}")]
public async Task<IActionResult> GetStudentKanbanAssignments(string studentId)
{
    // 1. معرفة المواد التي سجل بها الطالب
    var enrolledCourseIds = await _context.Enrollments
        .Where(e => e.StudentId == studentId)
        .Select(e => e.CourseId)
        .ToListAsync();

    // 2. جلب جميع الواجبات المرتبطة بهذه المواد
    var allAssignments = await _context.Assignments
        .Where(a => enrolledCourseIds.Contains(a.CourseId))
        .Include(a => a.Course)
        .ToListAsync();

    // 3. جلب تسليمات الطالب
    var mySubmissions = await _context.AssignmentSubmissions
        .Where(s => s.StudentId == studentId)
        .ToListAsync();

    // 4. دمج البيانات لتحديد الحالة
    var kanbanData = allAssignments.Select(assignment => 
    {
        var submission = mySubmissions.FirstOrDefault(s => s.AssignmentId == assignment.Id);
        
        string status = "ToDo"; // الحالة الافتراضية: لم يتم الحل
        double? grade = null;
        string? feedback = null;

        if (submission != null)
        {
            if (submission.IsGraded)
            {
                status = "Graded"; // تم التقييم
                grade = submission.Grade;
                feedback = submission.TeacherFeedback;
            }
            else
            {
                status = "Submitted"; // تم الحل وبانتظار التصحيح
            }
        }

        return new
        {
            assignment.Id,
            assignment.Title,
            assignment.Description,
            assignment.DueDate,
            CourseName = assignment.Course.Name,
            Status = status, // ToDo, Submitted, Graded
            Grade = grade,
            Feedback = feedback,
            FilePath = assignment.AttachmentPath // ملف المرفق إن وجد
        };
    });
    return Ok(kanbanData);
}


// ==========================================
// 8. رفع حل الواجب (Student Submission)
// ==========================================
[HttpPost("assignment/submit")]
public async Task<IActionResult> SubmitAssignment([FromForm] StudentSubmissionDto dto)
{
    // 1. إنشاء سجل التسليم
    var submission = new AssignmentSubmission
    {
        AssignmentId = dto.AssignmentId,
        StudentId = dto.StudentId,
        SubmissionDate = DateTime.UtcNow,
        Notes = dto.Notes,
        IsGraded = false
    };

    // 2. معالجة رفع الملف (إذا وجد)
    if (dto.File != null && dto.File.Length > 0)
    {
        // تحديد مسار الحفظ (wwwroot/uploads/submissions)
        var folderName = Path.Combine("wwwroot", "uploads", "submissions");
        var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);

        if (!Directory.Exists(pathToSave)) Directory.CreateDirectory(pathToSave);

        // توليد اسم فريد للملف
        var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
        var fullPath = Path.Combine(pathToSave, fileName);
        
        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        // حفظ المسار النسبي في قاعدة البيانات
        submission.FilePath = Path.Combine("uploads", "submissions", fileName).Replace("\\", "/");
        submission.FileName = dto.File.FileName;
    }

    _context.AssignmentSubmissions.Add(submission);
    await _context.SaveChangesAsync();

    return Ok(new { message = "تم تسليم الواجب بنجاح! 🎉" });
}



    }



// DTO لاستقبال البيانات
public class StudentSubmissionDto
{
    public string AssignmentId { get; set; }
    public string StudentId { get; set; }
    public string? Notes { get; set; }
    public IFormFile? File { get; set; }
}
    // كلاسات مساعدة لاستقبال البيانات (DTOs)
    public class ExamSubmissionDto
    {
        public string StudentId { get; set; }
        public string ExamId { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }

    public class AnswerDto
    {
        public string QuestionId { get; set; }
        public string SelectedAnswer { get; set; }
    }
}