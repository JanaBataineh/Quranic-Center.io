using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Models; 
using System; 
using BCrypt.Net; 

namespace QuranCenters.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Center> Centers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; } 
public DbSet<Enrollment> Enrollments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. تعريف ID ثابت للأدمن
            const string ADMIN_ID = "a1b2c3d4-e5f6-7777-8888-9999abcdef12";
            
            // 2. تعريف تاريخ ثابت
            var creationDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var adminUser = new User
            {
                Id = ADMIN_ID,
                Email = "admin@admin.com", 
                // 🌟🌟 الـ HASH الثابت لكلمة المرور "admin123" 🌟🌟
                PasswordHash = "$2a$11$8kX9V2C.9a9D6hJ3i4B5A6e7T8w0K1m2G4l6o9j4K7v1n9r2X2i3c.3s1J", 
                UserType = "Admin",
                FirstName = "Admin",
                MiddleName = "System",
                LastName = "User",
                Age = 99,
                CreatedAt = creationDate
            };

            modelBuilder.Entity<User>().HasData(adminUser);
        }
    }
}