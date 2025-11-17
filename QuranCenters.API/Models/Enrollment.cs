using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Enrollment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // ربط مع الطالب (Foreign Key)
        [ForeignKey("Student")]
        public string StudentId { get; set; } = null!;
        public User Student { get; set; } = null!;

        // ربط مع الدورة (Foreign Key)
        [ForeignKey("Course")]
        public string CourseId { get; set; } = null!;
        public Course Course { get; set; } = null!;

        // تفاصيل إضافية عن التسجيل
        public DateTime EnrollmentDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Active"; // Active, Completed
        public int Progress { get; set; } = 0; // نسبة الإنجاز
    }
}