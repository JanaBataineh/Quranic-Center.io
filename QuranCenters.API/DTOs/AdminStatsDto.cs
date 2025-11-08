namespace QuranCenters.API.DTOs
{
    public class AdminStatsDto
    {
        public int TotalCenters { get; set; }
        public int TotalCourses { get; set; }
        public int TotalUsers { get; set; }
        public int PendingCenters { get; set; }
        public int PendingCourses { get; set; }
        public int NewMessages { get; set; }
    }
}