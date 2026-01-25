using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvitationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InvitationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================================
        // 1. إرسال دعوة
        // ==========================================================
        [HttpPost("send")]
        // ✅ تصحيح: غيرنا int teacherId إلى string teacherId
        public async Task<IActionResult> SendInvitation(string centerId, string teacherId)
        {
            var existingInvite = await _context.Invitations
                .FirstOrDefaultAsync(x => x.CenterId == centerId 
                                       && x.TeacherId == teacherId 
                                       && x.Status == InviteStatus.Pending);

            if (existingInvite != null)
                return BadRequest("يوجد دعوة معلقة لهذا المعلم.");

            var alreadyLinked = await _context.CenterTeacherLinks
                .AnyAsync(x => x.CenterId == centerId && x.TeacherId == teacherId);

            if (alreadyLinked)
                return BadRequest("المعلم مسجل بالفعل في المركز.");

            var newInvite = new Invitation
            {
                CenterId = centerId,
                TeacherId = teacherId,
                Status = InviteStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Invitations.Add(newInvite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم الإرسال بنجاح" });
        }

        // ==========================================================
        // 2. عرض دعوات المعلم
        // ==========================================================
        [HttpGet("my-invites/{teacherId}")]
        // ✅ تصحيح: غيرنا int teacherId إلى string teacherId
        public async Task<IActionResult> GetTeacherInvites(string teacherId)
        {
            var invites = await _context.Invitations
                .Where(x => x.TeacherId == teacherId && x.Status == InviteStatus.Pending)
                .Select(x => new 
                {
                    x.Id,
                    x.CenterId,
                    CenterName = _context.Centers.Where(c => c.Id == x.CenterId).Select(c => c.Name).FirstOrDefault(), 
                    x.CreatedAt
                })
                .ToListAsync();

            return Ok(invites);
        }

        // ==========================================================
        // 3. الرد (قبول/رفض)
        // ==========================================================
        [HttpPost("respond")]
        public async Task<IActionResult> RespondToInvite([FromBody] InvitationRespondDto respondDto)
        {
            var invite = await _context.Invitations.FindAsync(respondDto.InvitationId);

            if (invite == null) return NotFound("الدعوة غير موجودة");

            if (invite.Status != InviteStatus.Pending) return BadRequest("تم الرد مسبقاً");

            if (respondDto.IsAccepted)
            {
                invite.Status = InviteStatus.Accepted;

                // إضافة للجدول الوسيط
                var link = new CenterTeacherLink
                {
                    CenterId = invite.CenterId,
                    TeacherId = invite.TeacherId
                };
                
                _context.CenterTeacherLinks.Add(link);
            }
            else
            {
                invite.Status = InviteStatus.Rejected;
            }
            var teacher = await _context.Users.FindAsync(invite.TeacherId);
var notification = new Notification
{
    UserId = invite.CenterId, // المستلم هو المركز
    Title = "قبول دعوة انضمام",
    Message = $"وافق المعلم {teacher.FirstName} {teacher.LastName} على الانضمام لمركزكم.",
    CreatedAt = DateTime.UtcNow
};
_context.Notifications.Add(notification);

            await _context.SaveChangesAsync();




            return Ok(new { message = respondDto.IsAccepted ? "تم القبول" : "تم الرفض" });
        }
   
   
   
    }
}