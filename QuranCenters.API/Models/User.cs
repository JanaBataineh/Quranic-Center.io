using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!; // 

        [Required]
        public string PasswordHash { get; set; } = null!; // 

        [Required]
        public string UserType { get; set; } = null!; // 

        // حقول الطالب التفصيلية
        public string FirstName { get; set; } = null!; // 
        public string MiddleName { get; set; } = null!; // 
        public string LastName { get; set; } = null!; // 
        public int Age { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}