using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.Api.Models.Gamification
{
	public class UserBadge
	{
		[Key]
		public int Id { get; set; }
		public string UserId { get; set; }
		[ForeignKey("UserId")]
		public ApplicationUser User { get; set; }
		public int BadgeId { get; set; }
		[ForeignKey("BadgeId")]
		public Badge Badge { get; set; }
		public DateTime AwardedAt { get; set; } = DateTime.UtcNow;
	}
}