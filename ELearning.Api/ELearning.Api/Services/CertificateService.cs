using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;

namespace ELearning.Api.Services
{
    public class CertificateService
    {
        public byte[] GenerateCertificate(string studentName, string courseTitle, string instructorName, DateTime date, string certificateId)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);
                            x.Item().AlignCenter().Text("CERTYFIKAT UKOÑCZENIA KURSU").SemiBold().FontSize(30).FontColor(Colors.Blue.Medium);
                            x.Item().AlignCenter().Text("Niniejszym zaœwiadcza siê, ¿e").FontSize(18);
                            x.Item().AlignCenter().Text(studentName).Bold().FontSize(36).Underline();
                            x.Item().AlignCenter().Text("ukoñczy³(a) z wynikiem pozytywnym kurs:").FontSize(18);
                            x.Item().AlignCenter().Text(courseTitle).Bold().FontSize(28).FontColor(Colors.Grey.Darken3);

                            x.Item().PaddingTop(30).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().AlignCenter().Text(date.ToString("dd.MM.yyyy")).FontSize(14);
                                    c.Item().AlignCenter().Text("Data ukoñczenia").FontSize(10).FontColor(Colors.Grey.Medium);
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().AlignCenter().Text(instructorName).FontSize(14);
                                    c.Item().AlignCenter().Text("Instruktor prowadz¹cy").FontSize(10).FontColor(Colors.Grey.Medium);
                                });
                            });

                            x.Item().PaddingTop(40).AlignCenter().Text($"ID Certyfikatu: {certificateId}").FontSize(10).FontColor(Colors.Grey.Lighten1);
                            x.Item().AlignCenter().Text("ELearning Platform").FontSize(10).FontColor(Colors.Grey.Lighten1);
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}