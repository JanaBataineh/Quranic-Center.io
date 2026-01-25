using Microsoft.AspNetCore.Identity; // ضروري لـ IdentityRole
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // ضروري لـ IdentityDbContext
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Models;
using System;
using BCrypt.Net;

namespace QuranCenters.API.Data
{
public class ApplicationDbContext : IdentityDbContext<User, IdentityRole, string>    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
        {
        }
        public DbSet<Center> Centers { get; set; }
        public DbSet<Course> Courses { get; set; }        
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Assignment> Assignments { get; set; } // الواجبات
        public DbSet<Exam> Exams { get; set; }             // الامتحانات
        public DbSet<Question> Questions { get; set; }     // الأسئلة
        public DbSet<HifzRecord> HifzRecords { get; set; } // سجلات التحفيظ
public DbSet<StudentNote> StudentNotes { get; set; }      // ملاحظات الطلاب
public DbSet<RevisionLog> RevisionLogs { get; set; }   // سجلات المراجعة
public DbSet<Schedule> Schedules { get; set; }
public DbSet<Attendance> Attendances { get; set; }
public DbSet<CenterTeacherLink> CenterTeacherLinks { get; set; }
public DbSet<Message> Messages { get; set; }
public DbSet<ActivityLog> ActivityLogs { get; set; }
public DbSet<Invitation> Invitations { get; set; }
public DbSet<Notification> Notifications { get; set; }
public DbSet<CenterEvent> CenterEvents { get; set; }
public DbSet<CenterTask> CenterTasks { get; set; }
public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
// أضف هذا السطر داخل الكلاس ApplicationDbContext
public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }
protected override void OnModelCreating(ModelBuilder Builder)
{
    base.OnModelCreating(Builder);

    Builder.Entity<CenterTeacherLink>()
        .HasOne(x => x.Center)
        .WithMany()
        .HasForeignKey(x => x.CenterId)
        .OnDelete(DeleteBehavior.Restrict);

    Builder.Entity<CenterTeacherLink>()
        .HasOne(x => x.Teacher)
        .WithMany()
        .HasForeignKey(x => x.TeacherId)
        .OnDelete(DeleteBehavior.Restrict);

        
Builder.Entity<CenterEvent>()
        .Property(e => e.RegistrationFee)
        .HasColumnType("decimal(18,2)");
    // ===========================================
    // 2. (الجديد) حل مشكلة Enrollments
    // ===========================================
    Builder.Entity<Enrollment>()
        .HasOne(x => x.Student)
        .WithMany()
        .HasForeignKey(x => x.StudentId)
        .OnDelete(DeleteBehavior.Cascade); // منع الحذف التلقائي

    Builder.Entity<Enrollment>()
        .HasOne(x => x.Course)
        .WithMany()
        .HasForeignKey(x => x.CourseId)
        .OnDelete(DeleteBehavior.Restrict); // منع الحذف التلقائي

    Builder.Entity<Schedule>()
        .HasOne(s => s.Teacher)
        .WithMany()
        .HasForeignKey(s => s.TeacherId)
        .OnDelete(DeleteBehavior.Restrict); 
    Builder.Entity<AssignmentSubmission>()
        .HasOne(s => s.Assignment)
        .WithMany()
        .HasForeignKey(s => s.AssignmentId)
        .OnDelete(DeleteBehavior.Restrict);       

Builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Id = "role_admin", Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Id = "role_teacher", Name = "Teacher", NormalizedName = "TEACHER" },
                new IdentityRole { Id = "role_student", Name = "Student", NormalizedName = "STUDENT" },
                new IdentityRole { Id = "role_center", Name = "Center", NormalizedName = "CENTER" }
            );

    // ===========================================
    // 3. بيانات الأدمن الافتراضية
    // ===========================================
    const string ADMIN_ID = "a1b2c3d4-e5f6-7777-8888-9999abcdef12";
    var creationDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    var adminUser = new User
    {
        Id = ADMIN_ID,
        UserName = "admin@admin.com", // ضروري لتسجيل الدخول
        NormalizedUserName = "ADMIN@ADMIN.COM",
        Email = "admin@admin.com",
        NormalizedEmail = "ADMIN@ADMIN.COM", // ضروري للبحث
        EmailConfirmed = true,
        PasswordHash = "$2a$11$8kX9V2C.9a9D6hJ3i4B5A6e7T8w0K1m2G4l6o9j4K7v1n9r2X2i3c.3s1J",
        SecurityStamp = Guid.NewGuid().ToString(), // ضروري للأمان
        UserType = "Admin",
        FirstName = "Admin",
        MiddleName = "System",
        LastName = "User",
        Age = 99,
        CreatedAt = creationDate
    };

    Builder.Entity<User>().HasData(adminUser);
    Builder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
            {
                RoleId = "role_admin",
                UserId = ADMIN_ID
            });
}

    }
}
