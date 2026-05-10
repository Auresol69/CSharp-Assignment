using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub_API.Migrations
{
    /// <inheritdoc />
    public partial class SyncCurrentModelAfterPull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE [Hashtag] SET [NoiDung] = CONCAT('unknown-', [IdHashtag]) WHERE [NoiDung] IS NULL;");

            migrationBuilder.DropIndex(
                name: "UX_Hashtag_NoiDung",
                table: "Hashtag");

            migrationBuilder.AlterColumn<string>(
                name: "NoiDung",
                table: "Hashtag",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "UX_Hashtag_NoiDung",
                table: "Hashtag",
                column: "NoiDung",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Hashtag_NoiDung",
                table: "Hashtag");

            migrationBuilder.AlterColumn<string>(
                name: "NoiDung",
                table: "Hashtag",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateIndex(
                name: "UX_Hashtag_NoiDung",
                table: "Hashtag",
                column: "NoiDung",
                unique: true,
                filter: "[NoiDung] IS NOT NULL");
        }
    }
}
