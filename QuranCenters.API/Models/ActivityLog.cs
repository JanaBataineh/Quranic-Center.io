using System;
using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        public string Action { get; set; } = string.Empty; // وصف الحدث (مثلاً: تم إضافة مركز جديد)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // وقت الحدث
    }
}