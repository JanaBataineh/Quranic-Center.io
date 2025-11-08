using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Models; // لاستخدام Center و User

namespace QuranCenters.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // تحديد الجداول التي ستكون في قاعدة البيانات
        public DbSet<Center> Centers { get; set; }
        
        // 🌟🌟 هذا هو السطر الذي كان مفقوداً 🌟🌟
        public DbSet<User> Users { get; set; } 
    }
}