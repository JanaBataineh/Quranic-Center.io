using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class AssignmentSubmission
    {
        [Key]
        public int Id { get; set; }

        // ربط مع الواجب
        public string AssignmentId { get; set; }
        [ForeignKey("AssignmentId")]
        public Assignment? Assignment { get; set; }

        // ربط مع الطالب
        public string StudentId { get; set; }
        [ForeignKey("StudentId")]
        public User? Student { get; set; }

        // تفاصيل التسليم
        public string? Notes { get; set; }
        public string? FilePath { get; set; } // مسار الملف على السيرفر
        public string? FileName { get; set; } // اسم الملف الأصلي
        
        public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
        
        // للمعلم لاحقاً (رصد الدرجة)
        public bool IsGraded { get; set; } = false;
        public int? Grade { get; set; }
        public string? TeacherFeedback { get; set; }
    }
}