using ClientManagement.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Data;

public class ApplicationDbContext : IdentityDbContext<
    User,
    Role,
    int,
    IdentityUserClaim<int>,
    UserRole,
    IdentityUserLogin<int>,
    IdentityRoleClaim<int>,
    IdentityUserToken<int>>
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(user =>
        {
            user.ToTable("Users");
            user.Property(existingUser => existingUser.UserName)
                .HasColumnName("Username")
                .HasColumnType("text")
                .IsRequired();
            user.Property(existingUser => existingUser.Email)
                .HasColumnType("text");
            user.Property(existingUser => existingUser.PasswordHash)
                .HasColumnType("text")
                .IsRequired();
            user.Property(existingUser => existingUser.NormalizedUserName)
                .HasColumnType("text");
            user.Property(existingUser => existingUser.NormalizedEmail)
                .HasColumnType("text");
            user.HasIndex(existingUser => existingUser.NormalizedUserName)
                .IsUnique();
        });

        modelBuilder.Entity<Role>(role =>
        {
            role.ToTable("Roles");
            role.Property(existingRole => existingRole.Name)
                .HasColumnType("text")
                .IsRequired();
            role.Property(existingRole => existingRole.NormalizedName)
                .HasColumnType("text");
            role.HasIndex(existingRole => existingRole.NormalizedName)
                .IsUnique();
        });

        modelBuilder.Entity<UserRole>(userRole =>
        {
            userRole.ToTable("UserRoles");
            userRole.HasKey(existingUserRole => new
            {
                existingUserRole.UserId,
                existingUserRole.RoleId
            });
            userRole.Property(existingUserRole => existingUserRole.Id)
                .ValueGeneratedOnAdd();
            userRole.HasIndex(existingUserRole => existingUserRole.Id)
                .IsUnique();
            userRole.HasOne(existingUserRole => existingUserRole.User)
                .WithMany(existingUser => existingUser.UserRoles)
                .HasForeignKey(existingUserRole => existingUserRole.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            userRole.HasOne(existingUserRole => existingUserRole.Role)
                .WithMany(existingRole => existingRole.UserRoles)
                .HasForeignKey(existingUserRole => existingUserRole.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");

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

       // Default client statuses
        modelBuilder.Entity<ClientStatus>().HasData(
            new ClientStatus { Id = 1, Name = "Active", Description = "Client is active" },
            new ClientStatus { Id = 2, Name = "Inactive", Description = "Client is inactive" },
            new ClientStatus { Id = 3, Name = "Pending", Description = "Client is pending approval" },
            new ClientStatus { Id = 4, Name = "Archived", Description = "Client record has been archived" }
        );

        // Default roles
        modelBuilder.Entity<Role>().HasData(
            new Role
            {
                Id = 1,
                Name = "Administrator",
                NormalizedName = "ADMINISTRATOR",
                ConcurrencyStamp = "f81a2d35-e1cb-4ce4-9f1d-25d471968d3e",
                Description = "Administrator with full access"
            },
            new Role
            {
                Id = 2,
                Name = "Staff",
                NormalizedName = "STAFF",
                ConcurrencyStamp = "65352708-6848-4cc9-8d21-84393cf66483",
                Description = "Regular user with limited access"
            },
            new Role
            {
                Id = 3,
                Name = "Viewer",
                NormalizedName = "VIEWER",
                ConcurrencyStamp = "b6e86694-e906-44e9-9e0d-6070bc5defce",
                Description = "Can view client records"
            }
        );
    }
}
