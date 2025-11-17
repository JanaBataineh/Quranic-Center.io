using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL; // 🌟🌟 هذا هو السطر المفقود 🌟🌟
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var securityKey = builder.Configuration["Jwt:Key"] ?? "ThisIsTheDefaultSecretKeyForTesting1234567890";
// 1. تعريف سياسة CORS
const string AllowAllOriginsPolicy = "AllowAllOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowAllOriginsPolicy,
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

// =As previous instructed:
// 1. سيحاول قراءة المتغير البسيط (للنشر على Railway)
// ... (الكود السابق لـ builder.Services.AddCors)

var connectionString = builder.Configuration["DATABASE_CONNECTION_STRING"];

if (string.IsNullOrEmpty(connectionString))
{
    // وضع التطوير المحلي: استخدم SQLite
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString) // <-- 🌟 تغيير هنا
    );
}
else
{
    // وضع النشر (Railway): استخدم PostgreSQL
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString) // <-- 🌟 تبقى كما هي
    );
}

// ... (باقي الكود: AddControllers, AddSwaggerGen, etc.)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // لتبسيط عملية الاختبار
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // مفتاح التشفير السري
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKey))
        };
    });

// 3. إضافة خدمة التفويض (Authorization)
builder.Services.AddAuthorization();
// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors(AllowAllOriginsPolicy); 
app.UseAuthentication(); // 🌟 يجب أن تأتي قبل UseAuthorization()
app.UseAuthorization();

app.MapControllers();

app.Run();