using System.ComponentModel.DataAnnotations;

namespace ELearning.Api.Models.Gamification
{
    public class Badge
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string IconUrl { get; set; }
        public string CriteriaType { get; set; }
        public int CriteriaThreshold { get; set; }
        public ICollection<UserBadge> UserBadges { get; set; }
    }
}