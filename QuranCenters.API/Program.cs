using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Npgsql; 

var builder = WebApplication.CreateBuilder(args);

// 1. إعداد الاتصال بقاعدة البيانات
var connectionString = builder.Configuration["DATABASE_CONNECTION_STRING"];

if (string.IsNullOrEmpty(connectionString))
{
    // وضع التطوير المحلي (SQLite)
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    // وضع النشر على Railway (PostgreSQL)
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// 2. إعدادات الـ JWT
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

// 3. إصلاح CORS (تحديد الروابط المسموحة بدقة)
const string AllowSpecificOrigins = "AllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins(
                    "https://quranic-center-io.vercel.app", // رابط موقعك
                    "http://localhost:5500",                 // رابط الاختبار المحلي 1
                    "http://127.0.0.1:5500"                  // رابط الاختبار المحلي 2
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. 🌟🌟 قسم التحديث التلقائي لقاعدة البيانات (الأهم) 🌟🌟
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        // يجبر النظام على إنشاء الجداول إذا لم تكن موجودة
        context.Database.Migrate();
        Console.WriteLine("✅ Database Migration Completed Successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database Migration Failed: {ex.Message}");
    }
}

// إعدادات الـ Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// تفعيل CORS
app.UseCors(AllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();