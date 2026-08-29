using ClientManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();

    public DbSet<ClientStatus> ClientStatuses => Set<ClientStatus>();

    public DbSet<ClientContact> ClientContacts => Set<ClientContact>();

    public DbSet<ClientAddress> ClientAddresses => Set<ClientAddress>();

    public DbSet<ClientDocument> ClientDocuments => Set<ClientDocument>();

    public DbSet<ClientActivityLog> ClientActivityLogs => Set<ClientActivityLog>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<UserRole> UserRoles => Set<UserRole>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // unique client number
        modelBuilder.Entity<Client>()
            .HasIndex(client => client.ClientNumber)
            .IsUnique();

        // Client Relationship status
        modelBuilder.Entity<Client>()
            .HasOne(client => client.Status)
            .WithMany(status => status.Clients)
            .HasForeignKey(client => client.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Client Contact relationship
        modelBuilder.Entity<ClientContact>()
            .HasOne(contact => contact.Client)
            .WithMany(client => client.Contacts)
            .HasForeignKey(contact => contact.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Client Address relationship
        modelBuilder.Entity<ClientAddress>()
            .HasOne(address => address.Client)
            .WithMany(client => client.Addresses)
            .HasForeignKey(address => address.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Client Document relationship
        modelBuilder.Entity<ClientDocument>()
            .HasOne(document => document.Client)
            .WithMany(client => client.Documents)
            .HasForeignKey(document => document.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Client Activity Log relationship
        modelBuilder.Entity<ClientActivityLog>()
            .HasOne(log => log.Client)
            .WithMany(client => client.ActivityLogs)
            .HasForeignKey(log => log.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserRole relationship
        modelBuilder.Entity<UserRole>()
            .HasOne(userRole => userRole.User)
            .WithMany(user => user.UserRoles)
            .HasForeignKey(userRole => userRole.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Role relationship
        modelBuilder.Entity<UserRole>()
            .HasOne(userRole => userRole.Role)
            .WithMany(role => role.UserRoles)
            .HasForeignKey(userRole => userRole.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasIndex(userRole => new { userRole.UserId, userRole.RoleId })
            .IsUnique();

       // Default client statuses
        modelBuilder.Entity<ClientStatus>().HasData(
            new ClientStatus { Id = 1, Name = "Active", Description = "Client is active" },
            new ClientStatus { Id = 2, Name = "Inactive", Description = "Client is inactive" },
            new ClientStatus { Id = 3, Name = "Pending", Description = "Client is pending approval" },
            new ClientStatus { Id = 4, Name = "Archived", Description = "Client record has been archived" }
        );

        // Default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Administrator", Description = "Administrator with full access" },
            new Role { Id = 2, Name = "Staff", Description = "Regular user with limited access" },
            new Role { Id = 3, Name = "Viewer", Description = "Can view client records" }
        );
    }
}