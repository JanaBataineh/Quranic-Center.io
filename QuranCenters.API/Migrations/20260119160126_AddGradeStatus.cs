using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GradeStatus",
                table: "Enrollments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "c8664ae4-60fb-43c5-8263-9ad61281645e", "39375b2c-1dc2-48c7-b9fe-95ae01f1362c" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GradeStatus",
                table: "Enrollments");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "5fb3265d-63fc-49af-83c3-695d510d6ed4", "755b99db-81c8-41f5-a36d-2a8165fb378c" });
        }
    }
}
