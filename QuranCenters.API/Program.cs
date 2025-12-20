using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 1. إعداد قاعدة البيانات (الذكي) 🧠
// ====================================================

string connectionString;

// محاولة جلب متغيرات البيئة (للعمل على Railway)
var pgHost = Environment.GetEnvironmentVariable("PGHOST");

if (!string.IsNullOrEmpty(pgHost))
{
    // نحن على السيرفر (Railway)
    var pgPort = Environment.GetEnvironmentVariable("PGPORT");
    var pgDb = Environment.GetEnvironmentVariable("PGDATABASE");
    var pgUser = Environment.GetEnvironmentVariable("PGUSER");
    var pgPass = Environment.GetEnvironmentVariable("PGPASSWORD");

    connectionString = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass};Ssl Mode=Require;Trust Server Certificate=true";
}
else
{
    // نحن على الجهاز المحلي (Localhost) - اقرأ من الملف
connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

// تسجيل خدمة قاعدة البيانات
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ====================================================
// 2. إعداد الـ JWT
// ====================================================
var securityKey = builder.Configuration["Jwt:Key"] ?? "ThisIsTheDefaultSecretKeyForTesting1234567890";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKey))
        };
    });

// 3. إعداد الـ CORS (مفتوح للعمل المحلي)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // اسمح لأي مصدر (مثل Live Server)
              .AllowAnyMethod()   // اسمح بـ GET, POST, PUT, DELETE
              .AllowAnyHeader();  // اسمح بأي ترويسة
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ====================================================
// 4. تحديث قاعدة البيانات تلقائياً
// ====================================================
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database Migration Completed Successfully!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database Migration Failed: {ex.Message}");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ====================================================
// 5. ترتيب الـ Middleware
// ====================================================

app.UseRouting();
app.UseCors("AllowAll"); // تفعيل CORS
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();