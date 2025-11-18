using ELearning.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ELearning.Api.Models.CourseContent;

namespace ELearning.Api.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<LessonCompletion> LessonCompletions { get; set; }
        public DbSet<UserQuizAttempt> UserQuizAttempts { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relacja Quiz - Section (One-to-One)
            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Section)
                .WithOne(s => s.Quiz)
                .HasForeignKey<Quiz>(q => q.SectionId);

            // Relacja Question - Quiz (Many-to-One)
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId);

            // Relacja AnswerOption - Question (Many-to-One)
            modelBuilder.Entity<AnswerOption>()
                .HasOne(a => a.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(a => a.QuestionId);

            // Relacja UserQuizAttempt - Quiz (Many-to-One)
            modelBuilder.Entity<UserQuizAttempt>()
                .HasOne(a => a.Quiz)
                .WithMany() // Można pominąć kolekcję w Quiz, jeśli nie jest potrzebna
                .HasForeignKey(a => a.QuizId);

            // Relacja UserQuizAttempt - ApplicationUser (Many-to-One)
            modelBuilder.Entity<UserQuizAttempt>()
                .HasOne(a => a.User)
                .WithMany() // Można pominąć kolekcję w ApplicationUser
                .HasForeignKey(a => a.UserId);

            // Relacja UserAnswer - UserQuizAttempt (Many-to-One)
            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.Attempt)
                .WithMany(a => a.UserAnswers)
                .HasForeignKey(ua => ua.AttemptId);

            // Relacja UserAnswer - Question (Many-to-One)
            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.Question)
                .WithMany() // Można pominąć kolekcję w Question
                .HasForeignKey(ua => ua.QuestionId);

            // Relacja UserAnswer - AnswerOption (Many-to-One)
            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.AnswerOption)
                .WithMany() // Można pominąć kolekcję w AnswerOption
                .HasForeignKey(ua => ua.AnswerOptionId);
        }
    }
}