namespace QuranCenters.API.Models
{
    public class CourseResource
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = "Link"; // PDF, Video
        public string Url { get; set; } = string.Empty;
        public string CourseId { get; set; } = null!; // Foreign Key
        public Course Course { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}