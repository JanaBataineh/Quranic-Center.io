using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class FinalSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "40b17726-6d33-4863-bb36-61f2f49eaf8a", "84ecb6e6-2e77-4e3f-97c7-e704abb621ef" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "5f6bb7a6-a15d-4ea4-8bde-2c58486b2e6e", "ce1f5849-790e-44df-9bf7-97c6b4aece92" });
        }
    }
}
