using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Schedule
    {
        public int Id { get; set; }

        public string CenterId { get; set; } // لربط الجدول بالمركز

        public string CourseId { get; set; } // ربط بالدورة
        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        public string TeacherId { get; set; } // ربط بالمعلم
        [ForeignKey("TeacherId")]
        public User? Teacher { get; set; }

        public string Day { get; set; } // sat, sun, mon ...
        public string StartTime { get; set; } // مثال: 14:30
        public string Location { get; set; } // القاعة 1، أونلاين...
    }
}