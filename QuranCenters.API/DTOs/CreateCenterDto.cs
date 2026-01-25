using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.DTOs
{
    public class CreateCenterDto
    {
        [Required(ErrorMessage = "اسم المركز مطلوب")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "المدينة مطلوبة")]
        public string City { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // ✅ تصحيح: إضافة قيود التحقق
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string Email { get; set; }

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [MinLength(6, ErrorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل")]
        public string Password { get; set; } 

        // === الحقول الجديدة ===
        public string? Classification { get; set; }
        public string? ManagerName { get; set; }
        public string? District { get; set; }
        public string? Neighborhood { get; set; }
        public string? StreetName { get; set; }
        public string? NearestLandmark { get; set; }
        public string? BuildingNumber { get; set; }
        public string? Floor { get; set; }
        public string? WorkingHours { get; set; }
        public DateTime? EstablishedDate { get; set; } 
    }
}