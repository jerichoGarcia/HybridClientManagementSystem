using ClientManagement.Api.Validation;

var accepted = new[]
{
    ("09171234567", "09171234567"),
    ("+639171234567", "09171234567"),
    ("639171234567", "09171234567"),
    (" 09171234567 ", "09171234567"),
};

foreach (var (input, expected) in accepted)
{
    Assert(PhilippineMobileValidator.TryNormalize(input, out var normalized) && normalized == expected, $"Expected {input} to normalize to {expected}.");
}

foreach (var input in new[] { "091234456677889", "0917123456", "08171234567", "0917abc4567", "+63917123456799", "1234567890", "0917 123 4567" })
{
    Assert(!PhilippineMobileValidator.TryNormalize(input, out _), $"Expected {input} to be rejected.");
}

Assert(PhilippineMobileValidator.TryNormalize(null, out var nullValue) && nullValue is null, "Null optional phone must remain null.");
Assert(PhilippineMobileValidator.TryNormalize(string.Empty, out var emptyValue) && emptyValue == string.Empty, "Empty optional phone must remain empty.");
Assert(PhilippineMobileValidator.IsMobileContactType("Mobile"), "Mobile must be identified as a mobile contact.");
Assert(PhilippineMobileValidator.IsMobileContactType(" mobile "), "Mobile matching must be case-insensitive and trimmed.");
Assert(!PhilippineMobileValidator.IsMobileContactType("Landline"), "Landline must not use mobile validation.");
Assert(!PhilippineMobileValidator.IsMobileContactType("Work"), "Work must not use mobile validation.");

Console.WriteLine("Philippine mobile validator tests passed.");

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}
