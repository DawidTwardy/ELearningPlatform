using ELearning.Api.Persistence;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace ELearning.Api.Models
{
	public class Enrollment
	{
		public int Id { get; set; }

		public int CourseId { get; set; }
		// U¿ycie operatora '!' informuje kompilator, ¿e ta w³aœciwoœæ zostanie zainicjalizowana przez EF Core.
		public Course Course { get; set; } = null!;

		public string ApplicationUserId { get; set; } = null!;
		// U¿ycie operatora '!'
		public ApplicationUser ApplicationUser { get; set; } = null!;

		public DateTime EnrollmentDate { get; set; }
	}
}