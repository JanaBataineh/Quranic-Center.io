using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherToCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TeacherId",
                table: "Courses",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "36dd71ed-210c-486e-9411-7704c01e3733", "5d01792d-3c91-4b1f-9ce3-dbbf692c4695" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_TeacherId",
                table: "Courses",
                column: "TeacherId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_AspNetUsers_TeacherId",
                table: "Courses",
                column: "TeacherId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_AspNetUsers_TeacherId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_TeacherId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "TeacherId",
                table: "Courses");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "52c540c0-4ac2-4788-ba99-15f812754e0d", "84e5ecfb-452f-4901-aa43-9670bacd8999" });
        }
    }
}
