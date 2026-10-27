using ClientManagement.Api.Data;
using ClientManagement.Api.DTOs;
using ClientManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId:int}/contacts")]
public class ClientContactsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientContactsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/clients/2/contacts
    [HttpGet]
    public async Task<IActionResult> GetContacts(int clientId)
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

        var contacts = await _context.ClientContacts
            .Where(contact => contact.ClientId == clientId)
            .OrderByDescending(contact => contact.IsPrimary)
            .ThenBy(contact => contact.ContactType)
            .ToListAsync();

        return Ok(contacts);
    }

    // POST: api/clients/2/contacts
    [HttpPost]
    public async Task<IActionResult> CreateContact(
        int clientId,
        CreateClientContactDto dto)
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

        if (string.IsNullOrWhiteSpace(dto.ContactType))
        {
            return BadRequest(new
            {
                message = "Contact type is required."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.ContactValue))
        {
            return BadRequest(new
            {
                message = "Contact value is required."
            });
        }

        var contact = new ClientContact
        {
            ClientId = clientId,
            ContactType = dto.ContactType.Trim(),
            ContactValue = dto.ContactValue.Trim(),
            IsPrimary = dto.IsPrimary,
            DateCreated = DateTime.UtcNow
        };

        // If this contact is primary,
        // remove primary status from existing contacts.
        if (contact.IsPrimary)
        {
            var existingPrimaryContacts =
                await _context.ClientContacts
                    .Where(c =>
                        c.ClientId == clientId &&
                        c.IsPrimary)
                    .ToListAsync();

            foreach (var existingContact in existingPrimaryContacts)
            {
                existingContact.IsPrimary = false;
            }
        }

        _context.ClientContacts.Add(contact);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetContact),
            new
            {
                clientId = clientId,
                id = contact.Id
            },
            contact
        );
    }

    // GET: api/clients/2/contacts/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetContact(
        int clientId,
        int id)
    {
        var contact = await _context.ClientContacts
            .FirstOrDefaultAsync(contact =>
                contact.Id == id &&
                contact.ClientId == clientId);

        if (contact == null)
        {
            return NotFound(new
            {
                message = "Contact not found."
            });
        }

        return Ok(contact);
    }

    // PUT: api/clients/2/contacts/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateContact(
        int clientId,
        int id,
        UpdateClientContactDto updatedContact)
    {
        var contact = await _context.ClientContacts
            .FirstOrDefaultAsync(contact =>
                contact.Id == id &&
                contact.ClientId == clientId);

        if (contact == null)
        {
            return NotFound(new
            {
                message = "Contact not found."
            });
        }

        if (string.IsNullOrWhiteSpace(updatedContact.ContactType))
        {
            return BadRequest(new
            {
                message = "Contact type is required."
            });
        }

        if (string.IsNullOrWhiteSpace(updatedContact.ContactValue))
        {
            return BadRequest(new
            {
                message = "Contact value is required."
            });
        }

        contact.ContactType = updatedContact.ContactType.Trim();
        contact.ContactValue = updatedContact.ContactValue.Trim();

        if (updatedContact.IsPrimary)
        {
            var existingPrimaryContacts =
                await _context.ClientContacts
                    .Where(c =>
                        c.ClientId == clientId &&
                        c.Id != id &&
                        c.IsPrimary)
                    .ToListAsync();

            foreach (var existingContact in existingPrimaryContacts)
            {
                existingContact.IsPrimary = false;
            }

            contact.IsPrimary = true;
        }
        else
        {
            contact.IsPrimary = false;
        }

        await _context.SaveChangesAsync();

        return Ok(contact);
    }

    // DELETE: api/clients/2/contacts/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContact(
        int clientId,
        int id)
    {
        var contact = await _context.ClientContacts
            .FirstOrDefaultAsync(contact =>
                contact.Id == id &&
                contact.ClientId == clientId);

        if (contact == null)
        {
            return NotFound(new
            {
                message = "Contact not found."
            });
        }

        _context.ClientContacts.Remove(contact);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Contact deleted successfully."
        });
    }
}