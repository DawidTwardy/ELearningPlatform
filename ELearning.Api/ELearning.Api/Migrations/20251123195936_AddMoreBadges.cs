using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ELearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreBadges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentStreak",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActivityDate",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    IconUrl = table.Column<string>(type: "TEXT", nullable: false),
                    CriteriaType = table.Column<string>(type: "TEXT", nullable: false),
                    CriteriaThreshold = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserBadges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    BadgeId = table.Column<int>(type: "INTEGER", nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBadges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserBadges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserBadges_Badges_BadgeId",
                        column: x => x.BadgeId,
                        principalTable: "Badges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_UserBadges_BadgeId",
                table: "UserBadges",
                column: "BadgeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_UserId",
                table: "UserBadges",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserBadges");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropColumn(
                name: "CurrentStreak",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastActivityDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "AspNetUsers");
        }
    }
}
