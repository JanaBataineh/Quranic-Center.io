using System; // تأكد من وجود هذا السطر للـ DateTime
using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string SenderName { get; set; } = string.Empty; // ✅ تم التعديل من Name
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? Phone { get; set; } // حقل ممتاز
        
        [Required]
        public string InquiryType { get; set; } = string.Empty; // حقل ممتاز
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty; // ✅ تم التعديل من Message لتجنب التكرار
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false; 
    }
}