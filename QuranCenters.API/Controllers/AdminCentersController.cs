using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.DTOs;

using QuranCenters.API.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace QuranCenters.API.Controllers
{
    [Route("api/admin/centers")] 
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminCentersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminCentersController(ApplicationDbContext context, 
                                      UserManager<User> userManager, 
                                      RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // 1. الإحصائيات
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new {
                TotalCenters = await _context.Centers.CountAsync(), 
                TotalCourses = await _context.Courses.CountAsync(), 
                TotalUsers = await _context.Users.CountAsync(),
                PendingCenters = await _context.Centers.CountAsync(c => c.Status == "pending"),
                NewMessages = await _context.ContactMessages.CountAsync(m => !m.IsRead) 
            };
            return Ok(stats);
        }

        // 2. النشاطات
        [HttpGet("activities")]
        public async Task<IActionResult> GetActivities()
        {
            var logs = await _context.ActivityLogs
                .OrderByDescending(l => l.CreatedAt)
                .Take(10)
                .ToListAsync();
            return Ok(logs);
        }

        // 3. عرض الكل
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var centers = await _context.Centers
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.City,
                    c.Phone,
                    c.Status,
                    c.ManagerName,
                    c.Classification
                })
                .ToListAsync();

            return Ok(centers);
        }

        // ============================================================
        // 4. دالة إضافة المركز (مصححة ومنظمة)
        // ============================================================

[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateCenterDto dto)
{
    try
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // 1. التحقق من التكرار
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return Conflict(new { message = "البريد الإلكتروني مسجل بالفعل لمستخدم آخر." });

        // 2. إنشاء المستخدم
        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.ManagerName ?? dto.Name,
            MiddleName = "-",
            LastName = "Center",
            UserType = "Center",
            PhoneNumber = dto.Phone,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = "فشل إنشاء حساب المستخدم: " + errors });
        }

        // 3. الصلاحيات
        if (!await _roleManager.RoleExistsAsync("Center"))
            await _roleManager.CreateAsync(new IdentityRole("Center"));
        
        await _userManager.AddToRoleAsync(user, "Center");

        // 4. حفظ المركز
        var center = new Center
        {
            // 👇👇 هذا هو السطر الذي كان ناقصاً 👇👇
            Id = Guid.NewGuid().ToString(), 
            // 👆👆 بدونه يفشل الحفظ 👆👆

            UserId = user.Id, 
            Name = dto.Name,
            City = dto.City,
            Address = dto.Address,
            Phone = dto.Phone,
            Email = dto.Email,
            Status = "approved",
            CreatedAt = DateTime.UtcNow,
            Classification = dto.Classification,
            ManagerName = dto.ManagerName,
            District = dto.District,
            Neighborhood = dto.Neighborhood,
            StreetName = dto.StreetName,
            NearestLandmark = dto.NearestLandmark,
            BuildingNumber = dto.BuildingNumber,
            Floor = dto.Floor,
            WorkingHours = dto.WorkingHours,
            EstablishedDate = dto.EstablishedDate ?? DateTime.UtcNow
        };

        _context.Centers.Add(center);
        
        // _context.ActivityLogs.Add(new ActivityLog { 
        //     Action = $"تم إضافة مركز جديد: {center.Name}", 
        //     CreatedAt = DateTime.UtcNow 
        // });

        await _context.SaveChangesAsync();
        
        return Ok(new { message = "تم إضافة المركز وإنشاء حسابه بنجاح", id = center.Id });
    }
    catch (Exception ex)
    {
        // تنظيف المستخدم عند الفشل
        try 
        {
            var createdUser = await _userManager.FindByEmailAsync(dto.Email);
            if (createdUser != null) await _userManager.DeleteAsync(createdUser);
        }
        catch { /* نتجاهل أخطاء التنظيف */ }

        return StatusCode(500, new { message = "حدث خطأ في السيرفر: " + ex.Message, details = ex.InnerException?.Message });
    }
}


        // 5. جلب بالتفاصيل
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود" });
            return Ok(center);
        }
    
        // 6. التعديل (مصحح لتحديث إيميل المستخدم أيضاً)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateCenterDto dto)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound(new { message = "المركز غير موجود" });

            // تحديث بيانات المستخدم (الإيميل) إذا تغير
            if (!string.IsNullOrEmpty(center.UserId))
            {
                var user = await _userManager.FindByIdAsync(center.UserId);
if (user != null && user.Email != dto.Email && !await _userManager.IsInRoleAsync(user, "Admin"))                {
                    var emailExists = await _userManager.FindByEmailAsync(dto.Email);
                    if (emailExists != null)
                        return Conflict(new { message = "البريد الإلكتروني الجديد مستخدم بالفعل" });

                    user.Email = dto.Email;
                    user.UserName = dto.Email;
                    user.EmailConfirmed = true;
                    
                    var updateResult = await _userManager.UpdateAsync(user);
                    if (!updateResult.Succeeded)
                        return BadRequest(new { message = "فشل تحديث البريد الإلكتروني للمستخدم" });
                }
            }

            // تحديث بيانات المركز
            center.Name = dto.Name;
            center.City = dto.City;
            center.Address = dto.Address;
            center.Phone = dto.Phone;
            center.Email = dto.Email;
            center.Classification = dto.Classification;
            center.ManagerName = dto.ManagerName;
            center.District = dto.District;
            center.Neighborhood = dto.Neighborhood;
            center.StreetName = dto.StreetName;
            center.NearestLandmark = dto.NearestLandmark;
            center.BuildingNumber = dto.BuildingNumber;
            center.Floor = dto.Floor;
            center.WorkingHours = dto.WorkingHours;
            if(dto.EstablishedDate.HasValue) center.EstablishedDate = dto.EstablishedDate;

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تحديث بيانات المركز بنجاح" });
        }

        // 7. الحذف (مصحح لحذف المستخدم أيضاً)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound();

            // حذف المستخدم المرتبط أولاً
            if (!string.IsNullOrEmpty(center.UserId))
            {
                var user = await _userManager.FindByIdAsync(center.UserId);
if (user != null && !await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    await _userManager.DeleteAsync(user);
                }
            }

            _context.Centers.Remove(center);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم حذف المركز وحسابه بنجاح" });
        }

        // 8. الاعتماد
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound();

            center.Status = "approved"; 
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم اعتماد المركز بنجاح" });
        }

        // 9. إلغاء الاعتماد
        [HttpPut("{id}/revoke")]
        public async Task<IActionResult> RevokeCenter(string id)
        {
            var center = await _context.Centers.FindAsync(id);
            if (center == null) return NotFound();

            center.Status = "pending"; 
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم إلغاء اعتماد المركز" });
        }
    }
}