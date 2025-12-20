using System.ComponentModel.DataAnnotations;

namespace QuranCenters.API.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = null!;

        [Required]
        [MinLength(6, ErrorMessage = "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.")]
        public string NewPassword { get; set; } = null!;
    }
}