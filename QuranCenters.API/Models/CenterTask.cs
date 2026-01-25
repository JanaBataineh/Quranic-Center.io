using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class CenterTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } // عنوان المهمة

        public string Description { get; set; } // وصف المهمة

        public string Status { get; set; } = "Todo"; // الحالة: Todo, Doing, Done

        public string Priority { get; set; } = "Normal"; // الأولوية: Normal, Urgent

        [Required]
        public string CenterId { get; set; } // ربط المهمة بمركز معين
        public Center Center { get; set; }
    }
}