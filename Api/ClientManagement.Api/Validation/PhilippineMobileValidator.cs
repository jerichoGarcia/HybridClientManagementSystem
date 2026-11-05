using System.Text.RegularExpressions;

namespace ClientManagement.Api.Validation;

public static partial class PhilippineMobileValidator
{
    /// <summary>
    /// Preserves absent or blank optional values. Nonblank values must be a
    /// Philippine mobile number and are returned in local 09XXXXXXXXX form.
    /// </summary>
    public static bool TryNormalize(string? value, out string? normalized)
    {
        normalized = value;

        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        var trimmed = value.Trim();

        if (LocalMobilePattern().IsMatch(trimmed))
        {
            normalized = trimmed;
            return true;
        }

        if (InternationalMobilePattern().IsMatch(trimmed))
        {
            normalized = $"0{trimmed[(trimmed[0] == '+' ? 3 : 2)..]}";
            return true;
        }

        return false;
    }

    public static bool IsMobileContactType(string? contactType) =>
        string.Equals(contactType?.Trim(), "Mobile", StringComparison.OrdinalIgnoreCase);

    [GeneratedRegex("^09\\d{9}$", RegexOptions.CultureInvariant)]
    private static partial Regex LocalMobilePattern();

    [GeneratedRegex("^\\+?639\\d{9}$", RegexOptions.CultureInvariant)]
    private static partial Regex InternationalMobilePattern();
}
