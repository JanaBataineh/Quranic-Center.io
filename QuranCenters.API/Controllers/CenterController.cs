using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.DTOs;
using QuranCenters.API.Models;
using System.Linq;
using System.Threading.Tasks;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CenterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CenterController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // 1. GET: /api/Center/my-info
        // (جلب بيانات المركز بناءً على الإيميل المرسل في الهيدر)
        // =======================================================
        
        // 🌟🌟 التصحيح هنا 🌟🌟
        // 1. أضفنا اسم الدالة: GetMyInfo
        // 2. أضفنا [FromHeader] لقراءة الإيميل من الطلب
        [HttpGet("my-info")]
        public async Task<IActionResult> GetMyInfo([FromHeader(Name = "User-Email")] string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "بيانات التحقق (الإيميل) مفقودة." });
            }

            var center = await _context.Centers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == userEmail.ToLower());

            if (center == null)
            {
                return NotFound(new { message = "لم يتم العثور على بيانات المركز المرتبطة بهذا الحساب." });
            }

            return Ok(center);
        }

        // =======================================================
        // 2. GET: /api/Center/courses/{centerId}
        // (جلب الدورات الخاصة بمركز معين)
        // =======================================================
        [HttpGet("courses/{centerId}")]
        public async Task<IActionResult> GetCoursesForCenter(string centerId)
        {
            // (TODO: يجب إضافة تحقق للتأكد من أن المستخدم يملك هذا المركز)
            
            var courses = await _context.Courses
                .Where(c => c.CenterId == centerId)
                .OrderBy(c => c.Name)
                .ToListAsync();
                
            return Ok(courses);
        }

        // =======================================================
        // 3. POST: /api/Center/courses
        // (إضافة دورة جديدة للمركز)
        // =======================================================
        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CourseDto courseDto)
        {
            // (TODO: يجب إضافة تحقق للتأكد من أن المستخدم يملك CenterId المرسل)

            var newCourse = new Course
            {
                Name = courseDto.Name,
                Level = courseDto.Level,
                Price = courseDto.Price,
                CenterId = courseDto.CenterId,
                Status = "pending" // الدورات الجديدة دائماً معلقة لموافقة الأدمن
            };

            _context.Courses.Add(newCourse);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تمت إضافة الدورة بنجاح، وهي بانتظار موافقة الأدمن.", course = newCourse });
        }

        // =======================================================
        // 4. DELETE: /api/Center/courses/{id}
        // (حذف دورة)
        // =======================================================
        [HttpDelete("courses/{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound(new { message = "الدورة غير موجودة." });
            }
            
            // (TODO: يجب إضافة تحقق للتأكد من أن المستخدم يملك هذه الدورة قبل حذفها)

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم حذف الدورة بنجاح." });
        }
    }
}