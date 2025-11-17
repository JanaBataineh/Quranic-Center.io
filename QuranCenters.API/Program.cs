using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Npgsql; 

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 1. إعداد قاعدة البيانات
// ====================================================
var connectionString = builder.Configuration["DATABASE_CONNECTION_STRING"];
if (string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}

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

// ====================================================
// 3. إعداد الـ CORS (مفتوح للجميع - الحل الجذري)
// ====================================================
builder.Services.AddCors(options =>
{
    // سياسة عامة تسمح للكل بدون شروط
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()   // اسمح لأي رابط (Vercel, Localhost, Mobile...)
               .AllowAnyMethod()   // GET, POST, PUT, DELETE
               .AllowAnyHeader();  // أي نوع بيانات
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
// 5. ترتيب الـ Middleware (مهم جداً جداً)
// ====================================================

app.UseRouting();

// ⚠️ تفعيل السياسة المفتوحة هنا قبل المصادقة ⚠️
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();