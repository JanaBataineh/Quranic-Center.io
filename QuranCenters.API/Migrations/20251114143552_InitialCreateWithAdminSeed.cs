using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateWithAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Age", "CreatedAt", "Email", "FirstName", "LastName", "MiddleName", "PasswordHash", "UserType" },
                values: new object[] { "a1b2c3d4-e5f6-7777-8888-9999abcdef12", 99, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@admin.com", "Admin", "User", "System", "admin123", "Admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12");
        }
    }
}
