namespace ShopFlow.Inventory.Domain.Events;

public record ProductAddedEvent(
    Guid ProductId,
    string ProductName,
    decimal Price,
    int InitialStock,
    Guid CategoryId,
    DateTime AddedAt
);