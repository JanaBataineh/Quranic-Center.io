using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class CenterEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } // اسم الفعالية

        public string Description { get; set; } // وصف الفعالية

        [Required]
        public DateTime Date { get; set; } // تاريخ الفعالية

        public string Time { get; set; } // وقت الفعالية

        public string Location { get; set; } // المكان

        public decimal RegistrationFee { get; set; } = 0; // رسوم التسجيل (اختياري)

        public string Status { get; set; } = "Upcoming"; // Upcoming, Completed, Cancelled

        [Required]
        public string CenterId { get; set; } // ربط الفعالية بمركز معين
        public Center Center { get; set; }
    }
}