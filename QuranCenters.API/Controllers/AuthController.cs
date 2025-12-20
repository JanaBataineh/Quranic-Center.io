using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.DTOs;
using System.Threading.Tasks;
using QuranCenters.API.Data;
using QuranCenters.API.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Collections.Generic;
using System;
using Google.Apis.Auth;
namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // =======================================================
        // REGISTER
        // =======================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
                return Conflict(new { message = "هذا البريد الإلكتروني مسجل بالفعل." });

            var user = new User
            {
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                LastName = request.LastName,
                Age = request.Age,
                Email = request.Email.ToLower(),
                UserType = request.UserType,
PasswordHash = request.Password,            };

            await _context.Users.AddAsync(user);
            
            // 🌟 إذا كان المسجل مركزاً، ننشئ له سجلاً في جدول المراكز فوراً
            if (request.UserType == "Center")
            {
                var center = new Center
                {
                    Id = user.Id, // نفس الآيدي لربط الحساب بالمركز
                    Name = $"{request.FirstName} {request.LastName}",
                    Email = request.Email,
                    City = "غير محدد",
                    Address = "غير محدد",
                    Phone = "غير محدد",
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Centers.AddAsync(center);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "تم إنشاء الحساب بنجاح!" });
        }

        // =======================================================
        // LOGIN
        // =======================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

            if (user == null)
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });

bool isPasswordValid = request.Password == user.PasswordHash;

if (!isPasswordValid)
    return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
            // إنشاء التوكن الصحيح
            string token = CreateToken(user);

            return Ok(new
            {
                message = "تم تسجيل الدخول بنجاح!",
                token = token,
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
        private string CreateToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ThisIsTheDefaultSecretKeyForTesting1234567890")
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.UserType)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
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
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

        if (user == null)
        {
            // 3. إذا لم يكن موجوداً، ننشئ له حساب طالب تلقائياً
            user = new User
            {
                Email = payload.Email,
                FirstName = payload.GivenName ?? "User",
                LastName = payload.FamilyName ?? "New",
                MiddleName = "-",
                Age = 0, // قيمة افتراضية
                UserType = "Student", // نوع الحساب الافتراضي
                // كلمة سر عشوائية لأنه سيدخل عبر جوجل دائماً
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()) 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // 4. إصدار التوكن الخاص بنظامنا (نفس دالة Login العادية)
        var token = CreateToken(user);

        return Ok(new
        {
            message = "تم تسجيل الدخول بنجاح عبر Google!",
            token = token,
            user_info = new
            {
                Email = user.Email,
                UserType = user.UserType,
                FullName = $"{user.FirstName} {user.LastName}"
            }
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "فشل التحقق من Google", error = ex.Message });
    }
}
    }
}