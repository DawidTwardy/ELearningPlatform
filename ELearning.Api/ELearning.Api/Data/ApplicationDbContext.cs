using ELearning.Api.Models;
using ELearning.Api.Models.CourseContent;
using ELearning.Api.Models.Gamification;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ELearning.Api.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<LessonCompletion> LessonCompletions { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<UserQuizAttempt> UserQuizAttempts { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }

        // Nowe tabele
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CourseReview> Reviews { get; set; }

        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserNote> UserNotes { get; set; }
        public DbSet<PushSubscription> PushSubscriptions { get; set; }
        public DbSet<LessonResource> LessonResources { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Relacja Użytkownik - Odznaki
            builder.Entity<UserBadge>()
                .HasKey(ub => new { ub.UserId, ub.BadgeId });

            builder.Entity<UserBadge>()
                .HasOne(ub => ub.User)
                .WithMany(u => u.UserBadges)
                .HasForeignKey(ub => ub.UserId);

            builder.Entity<UserBadge>()
                .HasOne(ub => ub.Badge)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeId);
        }
    }
}