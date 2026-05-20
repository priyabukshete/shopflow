namespace ShopFlow.Identity.Domain.ValueObjects;

public record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty");

        if (!value.Contains('@'))
            throw new ArgumentException("Email is not valid");

        Value = value.ToLowerInvariant();
    }

    public override string ToString() => Value;
}