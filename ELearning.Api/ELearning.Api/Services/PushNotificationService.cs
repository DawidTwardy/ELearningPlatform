using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using WebPush;
using System.Linq;
using Newtonsoft.Json;

namespace ELearning.Api.Services
{
    public class PushNotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public PushNotificationService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task SendNotificationToAllAsync(string title, string message, string url = "/")
        {
            var subscriptions = await _context.PushSubscriptions.ToListAsync();

            var vapidDetails = new VapidDetails(
                _configuration["VapidSettings:Subject"],
                _configuration["VapidSettings:PublicKey"],
                _configuration["VapidSettings:PrivateKey"]
            );

            var webPushClient = new WebPushClient();
            var payload = JsonConvert.SerializeObject(new
            {
                title,
                body = message,
                url,
                icon = "/src/logo.png"
            });

            foreach (var sub in subscriptions)
            {
                try
                {
                    var pushSubscription = new PushSubscription(sub.Endpoint, sub.P256dh, sub.Auth);
                    await webPushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);
                }
                catch (WebPushException ex)
                {
                    if (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        _context.PushSubscriptions.Remove(sub);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}