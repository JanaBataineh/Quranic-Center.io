using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models
{
    public class CenterTeacherLink
    {
        [Key]
        public int Id { get; set; }

        public string CenterId { get; set; } // 1. تم التعديل إلى int (ليطابق جدول المراكز)

        public string TeacherId { get; set; } 

        [ForeignKey("CenterId")] 
        public Center Center { get; set; }        

        [ForeignKey("TeacherId")] 
        public User Teacher { get; set; }

        public string Status { get; set; } = "Pending"; 
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    }
}