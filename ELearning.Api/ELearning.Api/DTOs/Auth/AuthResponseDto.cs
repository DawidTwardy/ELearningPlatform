namespace ELearning.Api.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public string AvatarUrl { get; set; }
    }
}