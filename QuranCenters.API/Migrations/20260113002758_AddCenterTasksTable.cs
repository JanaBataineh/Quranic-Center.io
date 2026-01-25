using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCenterTasksTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CenterTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CenterId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CenterTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CenterTasks_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "11c4d467-005c-47c9-80c2-a5fbf5d0531a", "947a84c9-123b-449c-891a-a3110d52d32f" });

            migrationBuilder.CreateIndex(
                name: "IX_CenterTasks_CenterId",
                table: "CenterTasks",
                column: "CenterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CenterTasks");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "db008b4d-0ec1-43bd-bc30-d16f1aa593b1", "d8afcffd-7e42-4d22-b384-c0913e79f804" });
        }
    }
}
