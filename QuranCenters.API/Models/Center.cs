using System.ComponentModel.DataAnnotations; 

namespace QuranCenters.API.Models
{
    public class Center
    {
        [Key] 
        public string Id { get; set; } = Guid.NewGuid().ToString(); 

        public string Name { get; set; } = null!; // 
        public string City { get; set; } = null!; // 
        public string Address { get; set; } = null!; // 
        public string Phone { get; set; } = null!; // 
        public string Email { get; set; } = null!; // 
        public int Established { get; set; }
        public string Status { get; set; } = "pending"; 
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}