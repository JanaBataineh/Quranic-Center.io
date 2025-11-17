namespace QuranCenters.API.DTOs
{
    public class StudentCourseDto
    {
        public string CourseId { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CenterName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Active, Completed
        public int Progress { get; set; } // نسبة التقدم
    }
}