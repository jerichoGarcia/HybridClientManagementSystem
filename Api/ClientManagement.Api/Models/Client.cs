namespace ClientManagement.Api.Models;

public class Client
{
    public int Id { get; set; }

    public string ClientNumber{ get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }

    public int StatusId { get; set; }

    public ClientStatus Status { get; set; } = null!;

    public ICollection<ClientContact> Contacts { get; set; } = new List<ClientContact>();

    public ICollection<ClientAddress> Addresses { get; set; } = new List<ClientAddress>();

    public ICollection<ClientDocument> Documents { get; set; } = new List<ClientDocument>();

    public ICollection<ClientActivityLog> ActivityLogs { get; set; } = new List<ClientActivityLog>();

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
}