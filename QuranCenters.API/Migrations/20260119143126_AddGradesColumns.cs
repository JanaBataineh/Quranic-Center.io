using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGradesColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Final",
                table: "Enrollments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Homework",
                table: "Enrollments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Midterm",
                table: "Enrollments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Participation",
                table: "Enrollments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "5fb3265d-63fc-49af-83c3-695d510d6ed4", "755b99db-81c8-41f5-a36d-2a8165fb378c" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Final",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "Homework",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "Midterm",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "Participation",
                table: "Enrollments");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "ad4ac5e2-1720-4ea9-a68b-8f4f13436b9c", "6a3b6e6a-6e13-4b31-b3b0-ac01965282ea" });
        }
    }
}
