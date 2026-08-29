using ClientManagement.Api.Data;
using ClientManagement.Api.DTOs;
using ClientManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/clients
    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _context.Clients
            .Include(client => client.Status)
            .OrderBy(client => client.LastName)
            .ToListAsync();

        return Ok(clients);
    }

    // GET: api/clients/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetClient(int id)
    {
        var client = await _context.Clients
            .Include(client => client.Status)
            .Include(client => client.Contacts)
            .Include(client => client.Addresses)
            .Include(client => client.Documents)
            .Include(client => client.ActivityLogs)
            .FirstOrDefaultAsync(client => client.Id == id);

        if (client == null)
        {
            return NotFound(new
            {
                message = "Client not found."
            });
        }

        return Ok(client);
    }

    // POST: api/clients
    [HttpPost]
    public async Task<IActionResult> CreateClient(CreateClientDto dto)
    {
        var client = new Client
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            MiddleName = dto.MiddleName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,

            // New clients are Active by default
            StatusId = 1,

            // Temporary unique value so the first save succeeds
            ClientNumber = $"TEMP-{Guid.NewGuid():N}"
        };

        _context.Clients.Add(client);

        // First save: PostgreSQL generates the Id
        await _context.SaveChangesAsync();

        // Generate the official Client Number
        client.ClientNumber = $"CL-{DateTime.UtcNow.Year}-{client.Id:D6}";

        // Second save: update the official Client Number
        await _context.SaveChangesAsync();

        return CreatedAtAction(
        nameof(GetClient),
        new { id = client.Id },
        client
        );
    }
}