using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranCenters.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCenterEventsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CenterEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Time = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RegistrationFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CenterId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CenterEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CenterEvents_Centers_CenterId",
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
                values: new object[] { "db008b4d-0ec1-43bd-bc30-d16f1aa593b1", "d8afcffd-7e42-4d22-b384-c0913e79f804" });

            migrationBuilder.CreateIndex(
                name: "IX_CenterEvents_CenterId",
                table: "CenterEvents",
                column: "CenterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CenterEvents");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-e5f6-7777-8888-9999abcdef12",
                columns: new[] { "ConcurrencyStamp", "SecurityStamp" },
                values: new object[] { "c27ddb8d-35e3-46f7-8050-2adaf3f0b7b9", "4ddcbdf7-f1bb-40d3-8555-04e56528ac4d" });
        }
    }
}
