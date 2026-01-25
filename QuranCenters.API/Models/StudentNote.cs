using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class StudentNote
    {
        [Key]
        public int Id { get; set; }
        public string StudentId { get; set; } = string.Empty; // لربط الملاحظة بالطالب
        public string Title { get; set; } = "ملاحظة جديدة";
        public string Content { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}