using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ELearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarsAndComments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseReviews_AspNetUsers_UserId",
                table: "CourseReviews");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseReviews_Courses_CourseId",
                table: "CourseReviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserBadges",
                table: "UserBadges");

            migrationBuilder.DropIndex(
                name: "IX_UserBadges_UserId",
                table: "UserBadges");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseReviews",
                table: "CourseReviews");

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.RenameTable(
                name: "CourseReviews",
                newName: "Reviews");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Comments",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Reviews",
                newName: "CreatedDate");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "Reviews",
                newName: "Comment");

            migrationBuilder.RenameIndex(
                name: "IX_CourseReviews_UserId",
                table: "Reviews",
                newName: "IX_Reviews_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CourseReviews_CourseId",
                table: "Reviews",
                newName: "IX_Reviews_CourseId");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "UserBadges",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserBadges",
                table: "UserBadges",
                columns: new[] { "UserId", "BadgeId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId",
                principalTable: "Comments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AspNetUsers_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Courses_CourseId",
                table: "Reviews",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AspNetUsers_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Courses_CourseId",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserBadges",
                table: "UserBadges");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "CourseReviews");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Comments",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "CourseReviews",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Comment",
                table: "CourseReviews",
                newName: "Content");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_UserId",
                table: "CourseReviews",
                newName: "IX_CourseReviews_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_CourseId",
                table: "CourseReviews",
                newName: "IX_CourseReviews_CourseId");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "UserBadges",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserBadges",
                table: "UserBadges",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseReviews",
                table: "CourseReviews",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "Id", "CriteriaThreshold", "CriteriaType", "Description", "IconUrl", "Name" },
                values: new object[,]
                {
                    { 1, 1, "LessonCount", "Ukończ pierwszą lekcję", "/badges/first_step.png", "Pierwszy krok" },
                    { 2, 5, "LessonCount", "Ukończ 5 lekcji", "/badges/student.png", "Pilny Student" },
                    { 3, 3, "QuizCount", "Zalicz 3 quizy", "/badges/quiz_master.png", "Mistrz Quizów" },
                    { 4, 3, "Streak", "Utrzymaj streak przez 3 dni", "/badges/marathon.png", "Systematyczność" },
                    { 5, 1, "QuizCount", "Zalicz pierwszy quiz", "/badges/rookie.png", "Debiutant" },
                    { 6, 100, "Points", "Zdobądź pierwsze 100 punktów", "/badges/starter_points.png", "Na start" },
                    { 7, 20, "LessonCount", "Ukończ 20 lekcji", "/badges/veteran.png", "Weteran" },
                    { 8, 10, "QuizCount", "Zalicz 10 quizów", "/badges/genius.png", "Geniusz" },
                    { 9, 7, "Streak", "Ucz się codziennie przez 7 dni", "/badges/week_streak.png", "Tydzień z głowy" },
                    { 10, 1000, "Points", "Zdobądź 1000 punktów", "/badges/collector.png", "Kolekcjoner" },
                    { 11, 30, "Streak", "Utrzymaj streak przez 30 dni!", "/badges/legend.png", "Legenda" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_UserId",
                table: "UserBadges",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId",
                principalTable: "Comments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseReviews_AspNetUsers_UserId",
                table: "CourseReviews",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseReviews_Courses_CourseId",
                table: "CourseReviews",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
