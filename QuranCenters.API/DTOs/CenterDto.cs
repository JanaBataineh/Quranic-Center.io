using System; 

namespace QuranCenters.API.DTOs
{
    public class CenterDto
    {
public string? Id { get; set; }
        
        public string Name { get; set; } = string.Empty; 
        public string City { get; set; } = string.Empty; 
        public string Address { get; set; } = string.Empty; 
        public string Phone { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty; 
        public int Established { get; set; }
        
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; } 

        // ✅ التصحيح: إضافة قيمة افتراضية لتجنب الخطأ
        public string Classification { get; set; } = string.Empty;
        public string ManagerName { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string NearestLandmark { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string WorkingHours { get; set; } = string.Empty;
    }
}