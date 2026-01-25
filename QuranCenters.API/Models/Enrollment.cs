using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Enrollment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // ربط مع الطالب
        [ForeignKey("Student")]
        public string StudentId { get; set; } = null!;
        public User Student { get; set; } = null!;

        // ربط مع الدورة
        [ForeignKey("Course")]
        public string CourseId { get; set; } = null!;
        public Course Course { get; set; } = null!;

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        // ✅ تمت إضافة هذا الحقل لحل المشكلة
        public int Progress { get; set; } = 0; 
        public double Participation { get; set; } = 0; // مشاركة (10)
        public double Homework { get; set; } = 0;      // واجبات (20)
        public double Midterm { get; set; } = 0;       // نصفي (30)
        public double Final { get; set; } = 0;         // نهائي (40)
public string GradeStatus { get; set; } = "Undefined";
        // خاصية للقراءة فقط لحساب المجموع (اختياري)
        [NotMapped] // لا يتم إنشاء عمود لها في قاعدة البيانات
        public double TotalScore => Participation + Homework + Midterm + Final;
    }
}