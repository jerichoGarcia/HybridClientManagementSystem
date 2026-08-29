namespace ClientManagement.Api.Models;

public class ClientAddress
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string AddressType { get; set; } = string.Empty;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? City { get; set; }

    public string? Province { get; set; }

    public string? PostalCode { get; set; }

    public string? Country { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public Client Client { get; set; } = null!;
}