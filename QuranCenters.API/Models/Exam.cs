using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Exam
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Title { get; set; } = string.Empty;

        public int DurationMinutes { get; set; } 

        public string Status { get; set; } = "Draft"; 

        [ForeignKey("Course")]
        public string CourseId { get; set; } = null!;
public Course? Course { get; set; } // لاحظ علامة الاستفهام
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}