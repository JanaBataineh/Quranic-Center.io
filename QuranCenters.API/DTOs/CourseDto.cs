using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.DTOs
{
    public class CourseDto
    {
        // هذه هي الحقول التي كان يشتكي منها المترجم
        public string? Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Level { get; set; } = null!;

        [Required]
        // ضروري جداً أن يكون decimal وليس double لتجنب مشاكل قاعدة البيانات
        public decimal Price { get; set; } 
        public string? TeacherId { get; set; }

        public string? Status { get; set; }

        public string? Description { get; set; } // حقل إضافي مفيد

        [Required]
        public string CenterId { get; set; } = null!;
    }
}