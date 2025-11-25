using ELearning.Api.Interfaces;
using ELearning.Api.Models;
using ELearning.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using WebPush;
using ELearning.Api.Persistence;
using ELearning.Api.Models.Gamification;

var builder = WebApplication.CreateBuilder(args);

var frontendUrl = builder.Configuration["FrontendUrl"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origin = !string.IsNullOrEmpty(frontendUrl) ? frontendUrl : "http://localhost:5173";

        policy.WithOrigins(origin)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ELearning.Api", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Podaj token JWT",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<CertificateService>();
builder.Services.AddScoped<FileStorageService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<PushNotificationService>();

builder.Services.AddSingleton(new VapidDetails(
    builder.Configuration["VapidSettings:Subject"],
    builder.Configuration["VapidSettings:PublicKey"],
    builder.Configuration["VapidSettings:PrivateKey"]
));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await SeedRolesAndAdminUser(userManager, roleManager);
        await SeedBadges(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during migration or seeding.");
    }
}

app.Run();

static async Task SeedRolesAndAdminUser(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
{
    const string adminRole = "Admin";
    const string instructorRole = "Instructor";

    const string adminEmail = "admin@admin.com";
    const string adminUserName = "admin";
    const string adminPassword = "Admin123!";

    if (!await roleManager.RoleExistsAsync(adminRole))
    {
        await roleManager.CreateAsync(new IdentityRole(adminRole));
    }
    if (!await roleManager.RoleExistsAsync(instructorRole))
    {
        await roleManager.CreateAsync(new IdentityRole(instructorRole));
    }

    var adminUser = await userManager.FindByNameAsync(adminUserName);

    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminUserName,
            Email = adminEmail,
            FirstName = "System",
            LastName = "Admin",
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(adminUser, adminPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, adminRole);
        }
    }
    else
    {
        if (!await userManager.IsInRoleAsync(adminUser, adminRole))
        {
            await userManager.AddToRoleAsync(adminUser, adminRole);
        }

        // Opcjonalnie reset has³a admina przy ka¿dym uruchomieniu (dla deweloperki)
        // await userManager.RemovePasswordAsync(adminUser);
        // await userManager.AddPasswordAsync(adminUser, adminPassword);
    }
}

static async Task SeedBadges(ApplicationDbContext context)
{
    if (!await context.Badges.AnyAsync())
    {
        var badges = new List<Badge>
        {
            new Badge { Name = "Pilny Student", Description = "Ukoñczono pierwsz¹ lekcjê", IconUrl = "student.png", CriteriaType = "LessonCount", CriteriaThreshold = 1 },
            new Badge { Name = "Weteran Nauki", Description = "Ukoñczono 5 lekcji", IconUrl = "veteran.png", CriteriaType = "LessonCount", CriteriaThreshold = 5 },
            new Badge { Name = "Quiz Master", Description = "Zaliczono 3 quizy", IconUrl = "quiz.png", CriteriaType = "QuizCount", CriteriaThreshold = 3 },
            new Badge { Name = "Systematycznoœæ", Description = "3 dni nauki z rzêdu", IconUrl = "streak.png", CriteriaType = "Streak", CriteriaThreshold = 3 },
            new Badge { Name = "Zbieracz Punktów", Description = "Zdob¹dŸ 100 punktów", IconUrl = "points100.png", CriteriaType = "Points", CriteriaThreshold = 100 },
            new Badge { Name = "Mistrz Wiedzy", Description = "Zdob¹dŸ 500 punktów", IconUrl = "points500.png", CriteriaType = "Points", CriteriaThreshold = 500 }
        };

        context.Badges.AddRange(badges);
        await context.SaveChangesAsync();
    }
}