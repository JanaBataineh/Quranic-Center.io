using Microsoft.EntityFrameworkCore; // 1. إضافة Using
using QuranCenters.API.Data; // 2. إضافة Using
var builder = WebApplication.CreateBuilder(args);

// 1. تعريف سياسة CORS قبل Build
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

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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

// 2. استخدام سياسة CORS قبل Controllers
app.UseCors(AllowAllOriginsPolicy); 

app.UseAuthorization();

app.MapControllers();

app.Run();