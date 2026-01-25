using System;

namespace QuranCenters.API.Models
{
    public class Message
    {
        public int Id { get; set; } // سنستخدم رقم تلقائي
        public string SenderName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false; // هل قرأها الأدمن أم لا
    }
}