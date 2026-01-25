using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Attendance
    {
        public int Id { get; set; }

        public string CourseId { get; set; } // لربط الحضور بالدورة
        
        public string EnrollmentId { get; set; } // لربط الحضور بالطالب (عبر سجل تسجيله)
        [ForeignKey("EnrollmentId")]
        public Enrollment? Enrollment { get; set; }

        public DateTime Date { get; set; } // تاريخ الحصة

        public string Status { get; set; } // present (حاضر), absent (غائب), late (تأخير)

        public string? Notes { get; set; } // الإنجاز أو الملاحظات (حفظ سورة كذا...)

        public int Rating { get; set; } = 0; // التقييم (من 1 إلى 5)
    }
}