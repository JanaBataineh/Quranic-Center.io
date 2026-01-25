using Microsoft.AspNetCore.Mvc;

namespace YourProject.Controllers // تأكدي من كتابة الـ Namespace الصحيح لمشروعك
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckController : ControllerBase
    {
        [HttpGet("hello")]
        public IActionResult Hello() => Ok("المشروع يعمل!");
    }
}