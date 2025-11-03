using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ELearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Instructor = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<double>(type: "REAL", nullable: false),
                    ImageSrc = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Courses");
        }
    }
}
