using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub_API.Migrations
{
    /// <inheritdoc />
    public partial class RedesignStory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "Story");

            migrationBuilder.AddColumn<string>(
                name: "Caption",
                table: "Story",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "Story",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "DATEADD(hour, 24, SYSUTCDATETIME())");

            migrationBuilder.AddColumn<string>(
                name: "MediaType",
                table: "Story",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MediaUrl",
                table: "Story",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Story_ExpiresAt",
                table: "Story",
                column: "ExpiresAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Story_ExpiresAt",
                table: "Story");

            migrationBuilder.DropColumn(
                name: "Caption",
                table: "Story");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "Story");

            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "Story");

            migrationBuilder.DropColumn(
                name: "MediaUrl",
                table: "Story");

            migrationBuilder.AddColumn<string>(
                name: "TrangThai",
                table: "Story",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
