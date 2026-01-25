using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class AttendanceRecord
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string StudentId { get; set; } // رقم الطالب
        public string CourseId { get; set; }  // رقم الدورة
        public DateTime Date { get; set; }    // تاريخ الحضور
        public string Status { get; set; }    // Present (حضور), Absent (غياب), Late (تأخر)
    }
}