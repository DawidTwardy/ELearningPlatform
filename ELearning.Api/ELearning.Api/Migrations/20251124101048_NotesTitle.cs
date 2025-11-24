using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class NotesTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserNotes_Lessons_LessonId",
                table: "UserNotes");

            migrationBuilder.DropIndex(
                name: "IX_UserNotes_LessonId",
                table: "UserNotes");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "UserNotes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "UserNotes");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotes_LessonId",
                table: "UserNotes",
                column: "LessonId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserNotes_Lessons_LessonId",
                table: "UserNotes",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
