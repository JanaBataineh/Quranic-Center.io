using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.DTOs;
using System.Threading.Tasks;
using QuranCenters.API.Models;
using Microsoft.AspNetCore.Identity; 
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Collections.Generic;
using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;

using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using QuranCenters.API.Data;
namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
       private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context; // ✅ أضفنا هذا عشان المراكز
  public AuthController(UserManager<User> userManager, 
                              RoleManager<IdentityRole> roleManager, 
                              IConfiguration config,
                              ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _config = config;
            _context = context;
        }

        // =======================================================
        // REGISTER
        // =======================================================
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] UserRegistrationDto request)
{
    // 1. التحقق من صحة البيانات
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    // 2. التحقق من التكرار
    var existingUser = await _userManager.FindByEmailAsync(request.Email);
    if (existingUser != null)
        return Conflict(new { message = "هذا البريد الإلكتروني مسجل بالفعل." });
string fixedRole = char.ToUpper(request.UserType[0]) + request.UserType.Substring(1).ToLower();
request.UserType = fixedRole;
    // 3. تجهيز كائن المستخدم (بدون PasswordHash وبدون Id يدوي)
    var user = new User
    {
        Email = request.Email.ToLower(),
        UserName = request.Email, // ضروري جداً لنظام Identity
        FirstName = request.FirstName,
        MiddleName = request.MiddleName,
        LastName = request.LastName,
        Age = request.Age,
        UserType = fixedRole,
        PhoneNumber = request.PhoneNumber,
        CreatedAt = DateTime.UtcNow,
        EmailConfirmed = true // تفعيل الحساب مباشرة
    };

// 4. الحفظ والتشفير التلقائي (هنا يتم الحفظ الفعلي)
    // نمرر (user) و (الباسورد الخام) ليقوم Identity بتشفيره وحفظه
    var result = await _userManager.CreateAsync(user, request.Password);

    // 5. التحقق من نجاح العملية
    if (!result.Succeeded)
    {
        // إرجاع الأخطاء (مثل: كلمة المرور ضعيفة، أو غيرها)
        return BadRequest(new { message = "فشل إنشاء الحساب", errors = result.Errors });
    }

// 6. إضافة الصلاحية (Role) للمستخدم
    // نتأكد أولاً أن الصلاحية موجودة في النظام، ثم نضيفها للمستخدم
    if (!await _roleManager.RoleExistsAsync(fixedRole))
        await _roleManager.CreateAsync(new IdentityRole(fixedRole));

    await _userManager.AddToRoleAsync(user, fixedRole);
if (fixedRole == "center")
    {
        var center = new Center
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id, // نأخذ الآيدي من المستخدم الذي تم إنشاؤه للتو
            Name = request.FirstName, // نفترض مؤقتاً أن اسم المركز هو الاسم الأول
            Email = request.Email.ToLower(),
            Phone = request.PhoneNumber ?? "غير محدد",
            City = "غير محدد",
            Address = "غير محدد",
            Status = "pending", // معلق حتى يوافق الأدمن
            CreatedAt = DateTime.UtcNow
        };

        // هنا نحتاج _context الذي أضفناه للكنترولر
        await _context.Centers.AddAsync(center);
        await _context.SaveChangesAsync();
    }
    return Ok(new { message = "تم إنشاء الحساب بنجاح!" });
}



        // =======================================================
        // LOGIN
        // =======================================================
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] UserLoginDto request)
{
    // 1. التحقق من صحة المدخلات
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    // 2. البحث عن المستخدم
var user = await _userManager.FindByEmailAsync(request.Email);
    // 3. التحقق من وجود المستخدم
    if (user == null)
        return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    // 4. التحقق من كلمة المرور (مقارنة مباشرة نصية)
var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
    if (!isPasswordValid)
        return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });

    // 5. إنشاء التوكن
var token = await CreateToken(user);

    return Ok(new
    {
        message = "تم تسجيل الدخول بنجاح!",
        token = token,
        userId = user.Id, 
        userType = user.UserType,
        user_info = new
        {
            Email = user.Email,
            UserType = user.UserType,
            FullName = $"{user.FirstName} {user.LastName}"
        }
    });
}











        // =======================================================
        // CREATE TOKEN
        // =======================================================
private async Task<string> CreateToken(User user)
        {
            var fixedKey = "ThisIsTheSecretKeyForTesting1234567890";
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(fixedKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("UserType", user.UserType),
                new Claim(ClaimTypes.Role, user.UserType)
            };
// 2. التغيير الثاني (الأهم): جلب الصلاحيات الحقيقية من جداول Identity
    var roles = await _userManager.GetRolesAsync(user);

    // 3. التغيير الثالث: إضافة كل الصلاحيات إلى التوكن
    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
        Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }







 [HttpPost("google-login")]
public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto model)
{
    try
    {
        // 1. التحقق من التوكن مع سيرفرات جوجل
        var payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken);

        // 2. البحث عن المستخدم في قاعدتنا
        var user = await _userManager.FindByEmailAsync(payload.Email);

        // 3. إذا لم يكن المستخدم موجوداً، نقوم بإنشائه (داخل الشرط فقط)
        if (user == null)
        {
            // أ. تجهيز الكائن
            user = new User
            {
                Email = payload.Email,
                UserName = payload.Email, 
                FirstName = payload.GivenName ?? "User",
                LastName = payload.FamilyName ?? "New",
                MiddleName = "-",
                Age = 0,
                UserType = "Student", // الافتراضي
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true
            };

            // ب. الإنشاء باستخدام Identity (هو يقوم بالحفظ والتشفير)
            // ❌ حذفنا _context.Users.Add لأن هذا السطر يغني عنه
            var result = await _userManager.CreateAsync(user, Guid.NewGuid().ToString() + "A@1");

            if (result.Succeeded)
            {
                // ج. إضافة الصلاحية
                if (!await _roleManager.RoleExistsAsync("Student"))
                    await _roleManager.CreateAsync(new IdentityRole("Student"));
                
                await _userManager.AddToRoleAsync(user, "Student");
            }
            else
            {
                return BadRequest(new { message = "فشل إنشاء حساب جوجل", errors = result.Errors });
            }
        }

        // 4. إصدار التوكن (سواء كان جديداً أو قديماً)
        var token = await CreateToken(user);

        return Ok(new 
        { 
            token = token,
            userType = user.UserType,
            userId = user.Id,
            fullName = $"{user.FirstName} {user.LastName}",
            message = "تم تسجيل الدخول بنجاح"
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "فشل التحقق من Google", error = ex.Message });
    }
}
    }}
