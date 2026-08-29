namespace ClientManagement.Api.Models;

public class ClientStatus
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<Client> Clients { get; set; } = new List<Client>();
}