using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } // الشخص المستلم للإشعار (مدير المركز)
        
        [Required]
        public string Title { get; set; } // عنوان الإشعار (مثلاً: تسجيل جديد)
        
        [Required]
        public string Message { get; set; } // نص الإشعار
        
        public bool IsRead { get; set; } = false; // هل قرأه المستخدم؟
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}