namespace ELearning.Api.DTOs.Auth
{
    public class TokenRequestDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}