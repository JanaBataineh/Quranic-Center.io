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
var connectionString = builder.Configuration["DATABASE_CONNECTION_STRING"];

// 2. إذا لم يجده (لأنه يعمل محلياً)، سيقرأ من appsettings.json
if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
);

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