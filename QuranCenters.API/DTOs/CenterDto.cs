using System; 

namespace QuranCenters.API.DTOs
{
    public class CenterDto
    {
        public string? Id { get; set; }
        
        public string Name { get; set; } = null!; // 
        public string City { get; set; } = null!; // 
        public string Address { get; set; } = null!; // 
        public string Phone { get; set; } = null!; // 
        public string Email { get; set; } = null!; // 
        public int Established { get; set; }
        
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; } 
    }
}