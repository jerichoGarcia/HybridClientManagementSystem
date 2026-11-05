using System.ComponentModel.DataAnnotations;

namespace ClientManagement.Api.DTOs;

public sealed class LoginRequestDto
{
    [Required, StringLength(254)]
    public string UsernameOrEmail { get; init; } = string.Empty;

    [Required, StringLength(256)]
    public string Password { get; init; } = string.Empty;
}
