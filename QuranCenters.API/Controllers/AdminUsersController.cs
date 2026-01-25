using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using QuranCenters.API.DTOs; // ✅ 1. أضفنا هذا السطر لحل مشكلة الخطأ الحالي
namespace QuranCenters.API.Controllers
{
    // هذا الرابط يجب أن يطابق تماماً ما هو مكتوب في الجافاسكربت
    [Route("api/Admin/users")] 
    [ApiController]
    [Authorize(Roles = "Admin")] // حماية: للمسؤولين فقط
    public class AdminUsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager; 
        private readonly ApplicationDbContext _context;
        public AdminUsersController(UserManager<User> userManager, 
                                    RoleManager<IdentityRole> roleManager,
                                    ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }
        // 1. جلب جميع المستخدمين (GET)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userManager.Users
                .Select(u => new
                {
                    u.Id,
                    // دمج الاسم ليكون اسماً كاملاً للعرض
                    FullName = u.FirstName + " " + u.LastName, 
                    u.Email,
                    u.UserType, // نوع المستخدم (طالب، معلم، الخ)
                    // بما أن IdentityUser لا يحتوي افتراضياً على IsActive، سنفترض أنهم نشطون
                    // إلا إذا كنت تستخدمين LockoutEnabled
                    IsActive = true 
                })
                .ToListAsync();

            return Ok(users);
        }

// 2. حذف مستخدم (DELETE)
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser(string id)
{
    var user = await _userManager.FindByIdAsync(id);
    if (user == null) return NotFound("المستخدم غير موجود");

    // === تنظيف بيانات المعلم ===
    // 1. حذف الارتباط بالمراكز
    var links = await _context.CenterTeacherLinks.Where(x => x.TeacherId == id).ToListAsync();
    if (links.Any()) _context.CenterTeacherLinks.RemoveRange(links);

    // 2. حذف الجداول الدراسية (إذا كان معلماً للحصة)
    var teacherSchedules = await _context.Schedules.Where(s => s.TeacherId == id).ToListAsync();
    if (teacherSchedules.Any()) _context.Schedules.RemoveRange(teacherSchedules);

    // 3. حذف الدعوات
    var invitations = await _context.Invitations.Where(i => i.TeacherId == id).ToListAsync();
    if (invitations.Any()) _context.Invitations.RemoveRange(invitations);


    // === تنظيف بيانات الطالب ===
    // 4. حذف تسجيلات الدورات (Enrollments)
    var enrollments = await _context.Enrollments.Where(e => e.StudentId == id).ToListAsync();
    if (enrollments.Any()) _context.Enrollments.RemoveRange(enrollments);

    // 5. حذف سجلات الحفظ (HifzRecords)
    var hifzRecords = await _context.HifzRecords.Where(h => h.StudentId == id).ToListAsync();
    if (hifzRecords.Any()) _context.HifzRecords.RemoveRange(hifzRecords);

    // 6. حذف الملاحظات
    var notes = await _context.StudentNotes.Where(n => n.StudentId == id).ToListAsync();
    if (notes.Any()) _context.StudentNotes.RemoveRange(notes);


    // === تنفيذ الحذف ===
    await _context.SaveChangesAsync(); // حفظ حذف البيانات الفرعية أولاً

    // الآن حذف المستخدم نفسه
    var result = await _userManager.DeleteAsync(user);

    if (!result.Succeeded) 
        return BadRequest(result.Errors);

    return Ok(new { message = "تم حذف المستخدم وكافة بياناته المرتبطة بنجاح" });
}
   // [HttpPost("create")]  <-- أضيفي هذه الدالة في ملف AdminUsersController.cs
[HttpPost("create")]
public async Task<IActionResult> CreateUser([FromBody] UserRegistrationDto model)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    // التحقق من وجود الإيميل
    var existingUser = await _userManager.FindByEmailAsync(model.Email);
    if (existingUser != null)
        return BadRequest(new { message = "البريد الإلكتروني مستخدم بالفعل" });

    var user = new User
    {
        UserName = model.Email,
        Email = model.Email,
        FirstName = model.FirstName,
        MiddleName = model.MiddleName,
        LastName = model.LastName,
        UserType = model.UserType,
        Age = model.Age,
        PhoneNumber = model.PhoneNumber ?? "0000000000",
        EmailConfirmed = true 
    };

    var result = await _userManager.CreateAsync(user, model.Password);

    if (result.Succeeded)
    {
        // إضافة الصلاحية (Role)
        if (!await _roleManager.RoleExistsAsync(model.UserType))
            await _roleManager.CreateAsync(new IdentityRole(model.UserType));
            
        await _userManager.AddToRoleAsync(user, model.UserType);

        return Ok(new { message = "تم إضافة المستخدم بنجاح" });
    }

    // تجميع الأخطاء وإرجاعها
    return BadRequest(new { message = "فشل الإنشاء", errors = result.Errors });
}
   
   
   
   
   
    }
}