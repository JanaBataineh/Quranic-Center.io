using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class HifzRecord
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [ForeignKey("Student")]
        public string StudentId { get; set; } = null!;
        public User Student { get; set; } = null!;

        public string Surah { get; set; } = string.Empty;
        public int FromAyah { get; set; }
        public int ToAyah { get; set; }
        
        public int Grade { get; set; } 
        
        public string? Notes { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}