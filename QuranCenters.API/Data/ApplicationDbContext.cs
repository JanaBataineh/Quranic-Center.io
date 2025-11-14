using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Models; 
using System; 

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

        // 🌟🌟 كود الـ Seeding المصحح 🌟🌟
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. تعريف ID ثابت للأدمن
            const string ADMIN_ID = "a1b2c3d4-e5f6-7777-8888-9999abcdef12";

            // 2. تعريف تاريخ ثابت
            var creationDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var adminUser = new User
            {
                Id = ADMIN_ID, // <-- تغيير هنا
                Email = "admin@admin.com", 
                PasswordHash = "admin123", 
                UserType = "Admin",
                FirstName = "Admin",
                MiddleName = "System",
                LastName = "User",
                Age = 99,
                CreatedAt = creationDate // <-- تغيير هنا
            };

            modelBuilder.Entity<User>().HasData(adminUser);
        }
    }
}