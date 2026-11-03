using System.ComponentModel.DataAnnotations;

namespace ClientManagement.Api.DTOs;

public class UpdateClientAddressDto
{
    [Required]
    public string AddressType { get; set; } = string.Empty;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? City { get; set; }

    public string? Province { get; set; }

    public string? PostalCode { get; set; }

    public string? Country { get; set; }

    public bool IsPrimary { get; set; }
}
