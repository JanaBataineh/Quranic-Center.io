using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class RevisionLog
    {
        [Key]
        public int Id { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public string SurahName { get; set; } = string.Empty; // اسم السورة أو الجزء المراجع
        public string Status { get; set; } = "Excellent"; // Excellent (أتقنت) OR NeedsReview (أحتاج مراجعة)
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }
}