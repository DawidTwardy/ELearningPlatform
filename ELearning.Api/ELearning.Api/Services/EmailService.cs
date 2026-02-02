using ELearning.Api.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace ELearning.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string message)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");

            try
            {
                using (var smtpClient = new SmtpClient(emailSettings["SmtpServer"]))
                {
                    smtpClient.Port = int.Parse(emailSettings["Port"]);
                    smtpClient.EnableSsl = true;
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(emailSettings["Username"], emailSettings["Password"]);

                    using (var mailMessage = new MailMessage
                    {
                        From = new MailAddress(emailSettings["SenderEmail"], emailSettings["SenderName"]),
                        Subject = subject,
                        Body = message,
                        IsBodyHtml = true,
                    })
                    {
                        mailMessage.To.Add(to);
                        await smtpClient.SendMailAsync(mailMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine(ex.InnerException.Message);
                }
                throw;
            }
        }
    }
}