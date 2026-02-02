using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using System;

namespace ELearning.Tests.Helpers
{
    public static class TestDatabaseHelper
    {
        public static ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }
    }
}