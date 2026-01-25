using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Assignment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime DueDate { get; set; }

        // العلاقة مع الدورة
        [ForeignKey("Course")]
        public string CourseId { get; set; } = null!;
        public Course? Course { get; set; } 
        public string? AttachmentPath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}