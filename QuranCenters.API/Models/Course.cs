using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class Course
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string Level { get; set; } = null!; // (مبتدئ, متوسط, متقدم)
        public double Price { get; set; }
        public string Status { get; set; } = "pending";

        // هذا هو المفتاح لربط الدورة بالمركز
        [ForeignKey("Center")]
        public string CenterId { get; set; } = null!;
        public Center Center { get; set; } = null!;
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}