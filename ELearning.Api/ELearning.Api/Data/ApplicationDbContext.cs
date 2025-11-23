using ELearning.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ELearning.Api.Models.CourseContent;
using ELearning.Api.Models.Gamification;

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
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<CourseReview> CourseReviews { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Section)
                .WithOne(s => s.Quiz)
                .HasForeignKey<Quiz>(q => q.SectionId);

            modelBuilder.Entity<Question>()
                .HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId);

            modelBuilder.Entity<AnswerOption>()
                .HasOne(a => a.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(a => a.QuestionId);

            modelBuilder.Entity<UserQuizAttempt>()
                .HasOne(a => a.Quiz)
                .WithMany()
                .HasForeignKey(a => a.QuizId);

            modelBuilder.Entity<UserQuizAttempt>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId);

            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.Attempt)
                .WithMany(a => a.UserAnswers)
                .HasForeignKey(ua => ua.AttemptId);

            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.Question)
                .WithMany()
                .HasForeignKey(ua => ua.QuestionId);

            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.AnswerOption)
                .WithMany()
                .HasForeignKey(ua => ua.AnswerOptionId);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // === SEEDOWANIE ODZNAK ===
            modelBuilder.Entity<Badge>().HasData(
                // Łatwe (na zachętę)
                new Badge { Id = 1, Name = "Pierwszy krok", Description = "Ukończ pierwszą lekcję", CriteriaType = "LessonCount", CriteriaThreshold = 1, IconUrl = "/badges/first_step.png" },
                new Badge { Id = 5, Name = "Debiutant", Description = "Zalicz pierwszy quiz", CriteriaType = "QuizCount", CriteriaThreshold = 1, IconUrl = "/badges/rookie.png" },
                new Badge { Id = 6, Name = "Na start", Description = "Zdobądź pierwsze 100 punktów", CriteriaType = "Points", CriteriaThreshold = 100, IconUrl = "/badges/starter_points.png" },

                // Średnie
                new Badge { Id = 2, Name = "Pilny Student", Description = "Ukończ 5 lekcji", CriteriaType = "LessonCount", CriteriaThreshold = 5, IconUrl = "/badges/student.png" },
                new Badge { Id = 3, Name = "Mistrz Quizów", Description = "Zalicz 3 quizy", CriteriaType = "QuizCount", CriteriaThreshold = 3, IconUrl = "/badges/quiz_master.png" },
                new Badge { Id = 4, Name = "Systematyczność", Description = "Utrzymaj streak przez 3 dni", CriteriaType = "Streak", CriteriaThreshold = 3, IconUrl = "/badges/marathon.png" },

                // Trudne (dla zaawansowanych)
                new Badge { Id = 7, Name = "Weteran", Description = "Ukończ 20 lekcji", CriteriaType = "LessonCount", CriteriaThreshold = 20, IconUrl = "/badges/veteran.png" },
                new Badge { Id = 8, Name = "Geniusz", Description = "Zalicz 10 quizów", CriteriaType = "QuizCount", CriteriaThreshold = 10, IconUrl = "/badges/genius.png" },
                new Badge { Id = 9, Name = "Tydzień z głowy", Description = "Ucz się codziennie przez 7 dni", CriteriaType = "Streak", CriteriaThreshold = 7, IconUrl = "/badges/week_streak.png" },
                new Badge { Id = 10, Name = "Kolekcjoner", Description = "Zdobądź 1000 punktów", CriteriaType = "Points", CriteriaThreshold = 1000, IconUrl = "/badges/collector.png" },
                new Badge { Id = 11, Name = "Legenda", Description = "Utrzymaj streak przez 30 dni!", CriteriaType = "Streak", CriteriaThreshold = 30, IconUrl = "/badges/legend.png" }
            );
        }
    }
}