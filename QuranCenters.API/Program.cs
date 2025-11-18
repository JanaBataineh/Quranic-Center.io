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
var host = Environment.GetEnvironmentVariable("PGHOST");
var port = Environment.GetEnvironmentVariable("PGPORT");
var database = Environment.GetEnvironmentVariable("PGDATABASE");
var user = Environment.GetEnvironmentVariable("PGUSER");
var password = Environment.GetEnvironmentVariable("PGPASSWORD");

var connectionString = $"Host={host};Port={port};Database={database};Username={user};Password={password};Ssl Mode=Require;Trust Server Certificate=true";

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

// ====================================================
// 3. إعداد الـ CORS (مفتوح للجميع - الحل الجذري)
// ====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins("https://quranic-center-io.vercel.app") // Add your frontend URL here
              .AllowAnyHeader()
              .AllowAnyMethod();
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
// Use CORS
app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapControllers();

app.Run();