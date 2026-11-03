using ClientManagement.Api.Data;
using ClientManagement.Api.DTOs;
using ClientManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId:int}/addresses")]
public class ClientAddressesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientAddressesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/clients/2/addresses
    [HttpGet]
    public async Task<IActionResult> GetAddresses(int clientId)
    {
        var clientExists = await _context.Clients
            .AnyAsync(client => client.Id == clientId);

        if (!clientExists)
        {
            return NotFound(new
            {
                message = "Client not found."
            });
        }

        var addresses = await _context.ClientAddresses
            .Where(address => address.ClientId == clientId)
            .OrderByDescending(address => address.IsPrimary)
            .ThenBy(address => address.AddressType)
            .ToListAsync();

        return Ok(addresses);
    }

    // GET: api/clients/2/addresses/5
    [HttpGet("{addressId:int}")]
    public async Task<IActionResult> GetAddress(int clientId, int addressId)
    {
        var address = await _context.ClientAddresses
            .FirstOrDefaultAsync(address =>
                address.Id == addressId &&
                address.ClientId == clientId);

        if (address == null)
        {
            return NotFound(new
            {
                message = "Address not found."
            });
        }

        return Ok(address);
    }

    // POST: api/clients/2/addresses
    [HttpPost]
    public async Task<IActionResult> CreateAddress(
        int clientId,
        CreateClientAddressDto dto)
    {
        var clientExists = await _context.Clients
            .AnyAsync(client => client.Id == clientId);

        if (!clientExists)
        {
            return NotFound(new
            {
                message = "Client not found."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.AddressType))
        {
            return BadRequest(new
            {
                message = "Address type is required."
            });
        }

        var address = new ClientAddress
        {
            ClientId = clientId,
            AddressType = dto.AddressType.Trim(),
            AddressLine1 = TrimToNull(dto.AddressLine1),
            AddressLine2 = TrimToNull(dto.AddressLine2),
            City = TrimToNull(dto.City),
            Province = TrimToNull(dto.Province),
            PostalCode = TrimToNull(dto.PostalCode),
            Country = TrimToNull(dto.Country),
            IsPrimary = dto.IsPrimary,
            DateCreated = DateTime.UtcNow
        };

        if (address.IsPrimary)
        {
            var existingPrimaryAddresses = await _context.ClientAddresses
                .Where(existingAddress =>
                    existingAddress.ClientId == clientId &&
                    existingAddress.IsPrimary)
                .ToListAsync();

            foreach (var existingAddress in existingPrimaryAddresses)
            {
                existingAddress.IsPrimary = false;
            }
        }

        _context.ClientAddresses.Add(address);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAddress),
            new
            {
                clientId,
                addressId = address.Id
            },
            address
        );
    }

    // PUT: api/clients/2/addresses/5
    [HttpPut("{addressId:int}")]
    public async Task<IActionResult> UpdateAddress(
        int clientId,
        int addressId,
        UpdateClientAddressDto dto)
    {
        var address = await _context.ClientAddresses
            .FirstOrDefaultAsync(address =>
                address.Id == addressId &&
                address.ClientId == clientId);

        if (address == null)
        {
            return NotFound(new
            {
                message = "Address not found."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.AddressType))
        {
            return BadRequest(new
            {
                message = "Address type is required."
            });
        }

        address.AddressType = dto.AddressType.Trim();
        address.AddressLine1 = TrimToNull(dto.AddressLine1);
        address.AddressLine2 = TrimToNull(dto.AddressLine2);
        address.City = TrimToNull(dto.City);
        address.Province = TrimToNull(dto.Province);
        address.PostalCode = TrimToNull(dto.PostalCode);
        address.Country = TrimToNull(dto.Country);

        if (dto.IsPrimary)
        {
            var existingPrimaryAddresses = await _context.ClientAddresses
                .Where(existingAddress =>
                    existingAddress.ClientId == clientId &&
                    existingAddress.Id != addressId &&
                    existingAddress.IsPrimary)
                .ToListAsync();

            foreach (var existingAddress in existingPrimaryAddresses)
            {
                existingAddress.IsPrimary = false;
            }

            address.IsPrimary = true;
        }
        else
        {
            address.IsPrimary = false;
        }

        await _context.SaveChangesAsync();

        return Ok(address);
    }

    // DELETE: api/clients/2/addresses/5
    [HttpDelete("{addressId:int}")]
    public async Task<IActionResult> DeleteAddress(int clientId, int addressId)
    {
        var address = await _context.ClientAddresses
            .FirstOrDefaultAsync(address =>
                address.Id == addressId &&
                address.ClientId == clientId);

        if (address == null)
        {
            return NotFound(new
            {
                message = "Address not found."
            });
        }

        _context.ClientAddresses.Remove(address);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Address deleted successfully."
        });
    }

    private static string? TrimToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
