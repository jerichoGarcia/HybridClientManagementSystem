using System.ComponentModel.DataAnnotations;

namespace ClientManagement.Api.DTOs;

public class UpdateClientContactDto
{
    [Required]
    public string ContactType { get; set; } = string.Empty;

    [Required]
    public string ContactValue { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }
}
