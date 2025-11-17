namespace QuranCenters.API.DTOs
{
    public class StudentProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int NotificationsCount { get; set; }
    }
}