namespace ELearning.Api.Models.CourseContent
{
    public class Lesson
    {
        public int Id { get; set; }
        public int SectionId { get; set; } // Klucz obcy do CourseSection
        public string Title { get; set; } = string.Empty;
        public int Order { get; set; } // Kolejnoœæ lekcji w sekcji
        public string Type { get; set; } = "video"; // 'video', 'pdf', 'text'
        public string Content { get; set; } = string.Empty; // URL dla wideo/pdf lub pe³ny HTML dla tekstu

        // Relacja
        public CourseSection Section { get; set; } // Nawigacja do Sekcji
    }
}