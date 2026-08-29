namespace ClientManagement.Api.Models;

public class ClientActivityLog
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string ActivityType { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? PerformedBy { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public Client Client { get; set; } = null!;
}