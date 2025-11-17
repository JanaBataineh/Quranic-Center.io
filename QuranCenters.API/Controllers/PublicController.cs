using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;

namespace QuranCenters.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================================
        // 1) جلب المراكز مع فلترة حسب المدينة
        // ================================
        [HttpGet("centers")]
        public async Task<IActionResult> GetCenters([FromQuery] string? city)
        {
            var query = _context.Centers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(c => c.City == city);

            var data = await query
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.City
                })
                .ToListAsync();

            return Ok(data);
        }

        // ================================
        // 2) جلب الدورات مع فلترة حسب:
        //    - المركز CenterId
        //    - المدينة City
        //    - المستوى Level
        // ================================
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses(
            [FromQuery] string? centerId,
            [FromQuery] string? city,
            [FromQuery] string? level)
        {
            var query = _context.Courses.Include(c => c.Center).AsQueryable();

            if (!string.IsNullOrWhiteSpace(centerId))
                query = query.Where(c => c.CenterId == centerId);

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(c => c.Center.City == city);

            if (!string.IsNullOrWhiteSpace(level))
                query = query.Where(c => c.Level == level);

            var data = await query
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Level,
                    Center = new {
                        c.Center.Id,
                        c.Center.Name,
                        c.Center.City
                    }
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}
