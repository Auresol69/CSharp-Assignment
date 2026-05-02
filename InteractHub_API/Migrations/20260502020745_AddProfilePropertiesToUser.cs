using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub_API.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePropertiesToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "TaiKhoan",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "TaiKhoan",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "TaiKhoan",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiaChi",
                table: "TaiKhoan",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GioiTinh",
                table: "TaiKhoan",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgaySinh",
                table: "TaiKhoan",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "DiaChi",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "GioiTinh",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "NgaySinh",
                table: "TaiKhoan");
        }
    }
}
