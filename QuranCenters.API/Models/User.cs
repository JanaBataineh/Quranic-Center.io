using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    // ✅ يجب أن يرث من IdentityUser لحل مشكلة PhoneNumber
    public class User : IdentityUser
    {
        // ❌ قمنا بحذف Id, Email, PasswordHash, PhoneNumber
        // لأنها موجودة تلقائياً داخل IdentityUser ولا يجوز تكرارها

        [Required]
        public string UserType { get; set; } // center, student

        // حقول إضافية خاصة بك
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public int Age { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        
        // إعدادات المركز
        public string? Description { get; set; } 
        public string? LogoPath { get; set; }
    }
}