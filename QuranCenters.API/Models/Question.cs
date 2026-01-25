using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Question
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Text { get; set; } = string.Empty;

        public string Type { get; set; } = "MCQ"; 

        public string Options { get; set; } = string.Empty; 
        
        public string CorrectAnswer { get; set; } = string.Empty;

        public int Points { get; set; } = 1;

        // التعديل هنا: جعلنا الحقل يقبل Null مؤقتاً
        [ForeignKey("Exam")]
        public string? ExamId { get; set; } // أضفنا علامة الاستفهام ؟
        public Exam? Exam { get; set; }     // أضفنا علامة الاستفهام ؟
    }
}