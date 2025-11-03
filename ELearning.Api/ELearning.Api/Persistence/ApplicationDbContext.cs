using ELearning.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ELearning.Api.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Course>().HasData(
                new Course
                {
                    Id = 1,
                    Title = "Kurs Nauki SQL",
                    Instructor = "Michał Nowak",
                    Rating = 5,
                    ImageSrc = "/src/course/placeholder_sql.png",
                    Description = "Poznaj podstawy i zaawansowane techniki SQL..."
                },
                new Course
                {
                    Id = 2,
                    Title = "Kurs Pythona",
                    Instructor = "Jan Kowalski",
                    Rating = 4.5,
                    ImageSrc = "/src/course/placeholder_python.png",
                    Description = "Zacznij swoją przygodę z programowaniem w Pythonie..."
                },
                new Course
                {
                    Id = 3,
                    Title = "Kurs AI",
                    Instructor = "Michał Nowak",
                    Rating = 4,
                    ImageSrc = "/src/course/placeholder_ai.png",
                    Description = "Wprowadzenie do świata Sztucznej Inteligencji..."
                },
                new Course
                {
                    Id = 4,
                    Title = "Kurs .Net Core",
                    Instructor = "Michał Nowak",
                    Rating = 5,
                    ImageSrc = "/src/course/placeholder_dotnet.png",
                    Description = "Buduj nowoczesne, wieloplatformowe aplikacje z .NET Core..."
                }
            );
        }
    }
}