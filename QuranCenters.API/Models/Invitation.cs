using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuranCenters.API.Models // 1. تم تعديل الاسم ليتطابق مع باقي المشروع
{
    public enum InviteStatus
    {
        Pending,  
        Accepted, 
        Rejected  
    }

    public class Invitation
    {
        [Key]
        public int Id { get; set; }

        public string CenterId { get; set; } 

        public string TeacherId { get; set; } // 2. تم التعديل إلى string (هام جداً)

        public InviteStatus Status { get; set; } = InviteStatus.Pending; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InvitationRespondDto
    {
        public int InvitationId { get; set; }
        public bool IsAccepted { get; set; } 
    }
}