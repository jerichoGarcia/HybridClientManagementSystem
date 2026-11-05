using ClientManagement.Api.Data;
using ClientManagement.Api.DTOs;
using ClientManagement.Api.Models;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClientManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private const string InvalidCredentialsMessage = "Invalid username, email, or password.";
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ApplicationDbContext _context;
    private readonly IAntiforgery _antiforgery;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, ApplicationDbContext context, IAntiforgery antiforgery)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _antiforgery = antiforgery;
    }

    [AllowAnonymous]
    [HttpGet("csrf")]
    public IActionResult GetCsrfToken()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { requestToken = tokens.RequestToken });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var identifier = request.UsernameOrEmail.Trim();
        if (string.IsNullOrEmpty(identifier) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { message = "Enter a username or email and password." });

        var normalized = _userManager.NormalizeName(identifier);
        var candidates = await _context.Users
            .Where(user => user.NormalizedUserName == normalized || user.NormalizedEmail == normalized)
            .Take(2)
            .ToListAsync();

        // A duplicate legacy email is treated as an invalid login rather than
        // selecting an arbitrary account or revealing account information.
        if (candidates.Count != 1 || !candidates[0].IsActive)
            return Unauthorized(new { message = InvalidCredentialsMessage });

        var result = await _signInManager.PasswordSignInAsync(candidates[0], request.Password, isPersistent: false, lockoutOnFailure: true);
        if (!result.Succeeded)
            return Unauthorized(new { message = InvalidCredentialsMessage });

        return Ok(await SessionPayload(candidates[0]));
    }

    [Authorize]
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null || !user.IsActive) return Unauthorized();
        return Ok(await SessionPayload(user));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    private async Task<object> SessionPayload(User user) => new
    {
        id = user.Id,
        username = user.UserName,
        displayName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(value => !string.IsNullOrWhiteSpace(value))),
        roles = await _userManager.GetRolesAsync(user)
    };
}
