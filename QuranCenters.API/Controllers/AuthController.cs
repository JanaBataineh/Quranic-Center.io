using Microsoft.AspNetCore.Mvc;
using QuranCenters.API.DTOs;
using System.Threading.Tasks;
using QuranCenters.API.Data;     // 1. إضافة Using
using QuranCenters.API.Models;    // 2. إضافة Using
using Microsoft.EntityFrameworkCore; // 3. إضافة Using

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 4. ربط قاعدة البيانات (بدلاً من MockUsers)
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // [نقطة نهاية التسجيل] - POST: api/Auth/register
        // =======================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 1. التحقق إذا كان البريد مسجل مسبقًا
            if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            {
                // 409 Conflict
                return Conflict(new { message = "هذا البريد الإلكتروني مسجل بالفعل." });
            }

            // 2. إنشاء مستخدم جديد
            var user = new User
            {
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                LastName = request.LastName,
                Age = request.Age,
                Email = request.Email.ToLower(),
                UserType = request.UserType, // "Student" أو "Center"

                // ⭐️ تنبيه أمني: هذا يخزن كلمة المرور كنص عادي
                // هذا يطابق المنطق الذي تحتاجه الآن ليعمل المشروع
                // في مشروع حقيقي، يجب عليك عمل "Hash" لكلمة المرور هنا
                PasswordHash = request.Password
            };

            // 3. إضافة المستخدم وحفظ التغييرات
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // 4. إرجاع رد ناجح
            // (يمكنك أيضاً تسجيل دخوله مباشرة وإرجاع Token)
            return Ok(new { message = "تم إنشاء الحساب بنجاح!" });
        }


        // =======================================================
        // [نقطة نهاية الدخول] - POST: api/Auth/login
        // =======================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 1. البحث عن المستخدم في قاعدة البيانات الحقيقية
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

            if (user == null)
            {
                // لم يتم العثور على المستخدم
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
            }

            // 2. التحقق من كلمة المرور (تحقق بسيط يطابق منطق التسجيل)
            bool isPasswordValid = request.Password == user.PasswordHash;

            if (!isPasswordValid)
            {
                // كلمة المرور غير صحيحة
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
            }

            // 3. محاكاة إنشاء الرمز المميز (JWT Token)
            var token = $"JWT.{user.UserType}.{Guid.NewGuid().ToString().Substring(0, 8)}"; // رمز وهمي

            // 4. إرجاع استجابة نجاح (مطابقة لما يتوقعه login.js)
            return Ok(new
            {
                message = $"تم تسجيل الدخول بنجاح! مرحباً بك.",
                token = token,
                user_info = new
                {
                    Email = user.Email,
                    UserType = user.UserType,
                    FullName = $"{user.FirstName} {user.LastName}"
                }
            });
        }
    }
}
