using Microsoft.AspNetCore.Identity;
using ELearning.Api.Models.Gamification;
using System;
using System.Collections.Generic;

namespace ELearning.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public int Points { get; set; } = 0;
        public int CurrentStreak { get; set; } = 0;
        public DateTime? LastActivityDate { get; set; }

        public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();

        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}