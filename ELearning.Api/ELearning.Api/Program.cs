// Plik: ELearningPlatform-main/ELearning.Api/ELearning.Api/Program.cs

using ELearning.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ELearning.Api.Controllers; // Upewniamy siê, ¿e ApplicationUser jest widoczny

var builder = WebApplication.CreateBuilder(args);

var MyReactAppPolicy = "MyReactAppPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyReactAppPolicy,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// Pobieranie konfiguracji JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured.");
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// Konfiguracja Identity
builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 4;
})
    .AddEntityFrameworkStores<ApplicationDbContext>();

// DODANIE JWT AUTHENTICATION
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});


var app = builder.Build();

// Uruchamia Swagger ZAWSZE
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors(MyReactAppPolicy);

// WA¯NE: Wymagane dla JWT
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();