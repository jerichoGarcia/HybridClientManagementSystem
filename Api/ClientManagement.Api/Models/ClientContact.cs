namespace ClientManagement.Api.Models;

public class ClientContact
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string ContactType { get; set; } = string.Empty;

    public string ContactValue { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public Client Client { get; set; } = null!;
}