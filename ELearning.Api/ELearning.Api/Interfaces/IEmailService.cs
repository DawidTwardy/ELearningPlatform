using System.Threading.Tasks;

namespace ELearning.Api.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string message);
    }
}