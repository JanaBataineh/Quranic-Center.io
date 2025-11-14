using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.DTOs
{
    public class CourseDto
    {
        public string? Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Level { get; set; } = null!;

        [Required]
        public double Price { get; set; }

        public string? Status { get; set; }

        [Required]
        public string CenterId { get; set; } = null!;
    }
}