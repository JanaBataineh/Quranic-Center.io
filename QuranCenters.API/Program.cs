using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL; // 🌟🌟 هذا هو السطر المفقود 🌟🌟

var builder = WebApplication.CreateBuilder(args);

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

app.UseAuthorization();

app.MapControllers();

app.Run();