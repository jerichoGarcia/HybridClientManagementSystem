namespace ClientManagement.Api.Models;

public class ClientDocument
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string DocumentType { get; set; } = string.Empty;

    public string DocumentName { get; set; } = string.Empty;

    public string? FilePath { get; set; }

    public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

    public string? UploadedBy { get; set; }

    public string Status { get; set; } = "Active";

    public Client Client { get; set; } = null!;
}