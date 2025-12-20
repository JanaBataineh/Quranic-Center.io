using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? Phone { get; set; }
        
        [Required]
        public string InquiryType { get; set; } = string.Empty; // نوع الاستفسار
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false; // هل تمت قراءتها؟
    }
}