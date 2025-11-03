using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ELearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.CreateTable(
                name: "CourseSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CourseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseSections_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lessons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SectionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lessons_CourseSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "CourseSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SectionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    QuizDataJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizzes_CourseSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "CourseSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseSections_CourseId",
                table: "CourseSections",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_SectionId",
                table: "Lessons",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_SectionId",
                table: "Quizzes",
                column: "SectionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Lessons");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "CourseSections");

            migrationBuilder.InsertData(
                table: "Courses",
                columns: new[] { "Id", "Description", "ImageSrc", "Instructor", "Rating", "Title" },
                values: new object[,]
                {
                    { 1, "Poznaj podstawy i zaawansowane techniki SQL...", "/src/course/placeholder_sql.png", "Michał Nowak", 5.0, "Kurs Nauki SQL" },
                    { 2, "Zacznij swoją przygodę z programowaniem w Pythonie...", "/src/course/placeholder_python.png", "Jan Kowalski", 4.5, "Kurs Pythona" },
                    { 3, "Wprowadzenie do świata Sztucznej Inteligencji...", "/src/course/placeholder_ai.png", "Michał Nowak", 4.0, "Kurs AI" },
                    { 4, "Buduj nowoczesne, wieloplatformowe aplikacje z .NET Core...", "/src/course/placeholder_dotnet.png", "Michał Nowak", 5.0, "Kurs .Net Core" }
                });
        }
    }
}
