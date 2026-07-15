using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub_Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddChatFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Conversation",
                columns: table => new
                {
                    IdConversation = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    User1Id = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    User2Id = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversation", x => x.IdConversation);
                    table.ForeignKey(
                        name: "FK_Conversation_TaiKhoan_User1Id",
                        column: x => x.User1Id,
                        principalTable: "TaiKhoan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conversation_TaiKhoan_User2Id",
                        column: x => x.User2Id,
                        principalTable: "TaiKhoan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Message",
                columns: table => new
                {
                    IdMessage = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ConversationId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsDeletedBySender = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Message", x => x.IdMessage);
                    table.ForeignKey(
                        name: "FK_Message_Conversation_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversation",
                        principalColumn: "IdConversation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Message_TaiKhoan_SenderId",
                        column: x => x.SenderId,
                        principalTable: "TaiKhoan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_LastMessageAt",
                table: "Conversation",
                column: "LastMessageAt");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_User2Id",
                table: "Conversation",
                column: "User2Id");

            migrationBuilder.CreateIndex(
                name: "UX_Conversation_User1_User2",
                table: "Conversation",
                columns: new[] { "User1Id", "User2Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Message_ConversationId_IsRead_SenderId",
                table: "Message",
                columns: new[] { "ConversationId", "IsRead", "SenderId" });

            migrationBuilder.CreateIndex(
                name: "IX_Message_ConversationId_SentAt",
                table: "Message",
                columns: new[] { "ConversationId", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Message_SenderId",
                table: "Message",
                column: "SenderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Message");

            migrationBuilder.DropTable(
                name: "Conversation");
        }
    }
}
