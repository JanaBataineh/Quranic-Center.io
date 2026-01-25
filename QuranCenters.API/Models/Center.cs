using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Center
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public string Name { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int Established { get; set; } // سنة التأسيس

        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // === الحقول الجديدة (مرة واحدة فقط) ===
        // جعلناها تقبل Null (?) لأنها قد تكون اختيارية عند الإضافة
        public string? Classification { get; set; }  // تصنيف
        public string? ManagerName { get; set; }     // اسم المدير
        public string? District { get; set; }        // اللواء
        public string? Area { get; set; }            // المنطقة
        public string? Neighborhood { get; set; }    // الحي
        public string? StreetName { get; set; }      // اسم الشارع
        public string? NearestLandmark { get; set; } // أقرب معلم
        public string? BuildingNumber { get; set; }  // رقم المبنى
        public string? Floor { get; set; }           // الطابق
        public string? WorkingHours { get; set; }    // ساعات الدوام
        
        // إذا كنت ستستخدم تاريخ تأسيس كامل بدلاً من السنة فقط:
        public DateTime? EstablishedDate { get; set; }
        public string? Description { get; set; }
public string? Location { get; set; }
public string? Logo { get; set; }
public string? Manager { get; set; } // أو نعتمد على جدول User
    }
}