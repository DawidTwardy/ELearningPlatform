using ELearning.Api.Services;
using QuestPDF.Infrastructure; 
using System;
using Xunit;

namespace ELearning.Tests.Services
{
    public class CertificateServiceTests
    {
        public CertificateServiceTests()
        {
           
            QuestPDF.Settings.License = LicenseType.Community;
        }

        [Fact]
        public void GenerateCertificate_ShouldReturnNonEmptyPdfStream()
        {
            var service = new CertificateService();

            var result = service.GenerateCertificate(
                "Dawid Twardy",
                "ASP.NET Core",
                "Andrzej Skowronek",
                DateTime.Now,
                "CERT-001"
            );

            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }
    }
}