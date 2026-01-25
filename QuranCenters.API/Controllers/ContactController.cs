using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer; // ✅ تأكد من وجود هذا
using System;
using System.Threading.Tasks;
using System.Linq;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. إرسال رسالة (مفتوح للجميع)
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ContactMessage message)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            message.CreatedAt = DateTime.UtcNow;
            message.IsRead = false;

            _context.ContactMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." });
        }

        // 2. عرض جميع الرسائل (للأدمن فقط)
        // ✅ التعديل هنا: حددنا AuthenticationSchemes لمنع التحويل لصفحة login
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllMessages()
        {
            var messages = await _context.ContactMessages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
            return Ok(messages);
        }

        // 3. تمييز الرسالة كمقروءة
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var msg = await _context.ContactMessages.FindAsync(id);
            if (msg == null) return NotFound();

            msg.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تحديث حالة الرسالة." });
        }

        // 4. حذف رسالة
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var msg = await _context.ContactMessages.FindAsync(id);
            if (msg == null) return NotFound();

            _context.ContactMessages.Remove(msg);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حذف الرسالة." });
        }
    }
}