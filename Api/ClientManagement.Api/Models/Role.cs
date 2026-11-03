using Microsoft.AspNetCore.Identity;

namespace ClientManagement.Api.Models;

public class Role : IdentityRole<int>
{
    public string? Description { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
