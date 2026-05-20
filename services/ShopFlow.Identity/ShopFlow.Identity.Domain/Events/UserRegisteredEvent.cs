namespace ShopFlow.Identity.Domain.Events;

public record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FullName,
    DateTime RegisteredAt
);