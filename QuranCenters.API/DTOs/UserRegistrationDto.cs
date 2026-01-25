using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.DTOs
{
    public class UserRegistrationDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string MiddleName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public int Age { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string UserType { get; set; } = "Student";

        // ✅ هذه هي الإضافات الضرورية لحل مشكلة الخطأ في AuthController
        public string? PhoneNumber { get; set; } 
        public string? Specialty { get; set; } 
    }
}