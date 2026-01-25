using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Course
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } // اسم الدورة
public string? TeacherId { get; set; } 
    [ForeignKey("TeacherId")]
    public virtual User? Teacher { get; set; }
        public string Level { get; set; } // المستوى

        public string Description { get; set; } // الوصف

        // 🛠️ الإصلاح 1: تغيير النوع إلى decimal ليتوافق مع الحسابات المالية
        [Column(TypeName = "decimal(18, 2)")] 
        public decimal Price { get; set; } 

        public string Status { get; set; } = "pending"; // الحالة (pending, approved)

        // 🛠️ الإصلاح 2: إضافة حقل تاريخ الإنشاء المفقود
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 

        // العلاقات
        public string CenterId { get; set; }
        
        [ForeignKey("CenterId")]
        public Center Center { get; set; }
    }
}