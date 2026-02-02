using ELearning.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using System.IO;
using System.Threading.Tasks;
using Xunit;

namespace ELearning.Tests.Services
{
    public class FileStorageServiceTests
    {
        [Fact]
        public async Task SaveFileAsync_ShouldGenerateUniqueFileName()
        {
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(m => m.WebRootPath).Returns(Directory.GetCurrentDirectory());
            var service = new FileStorageService(mockEnv.Object);

            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.FileName).Returns("video.mp4");
            fileMock.Setup(f => f.Length).Returns(1024);

            var path1 = await service.SaveFileAsync(fileMock.Object);
            var path2 = await service.SaveFileAsync(fileMock.Object);

            Assert.NotEqual(path1, path2);
            Assert.Contains("/uploads/", path1);
        }
    }
}