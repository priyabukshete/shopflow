namespace ShopFlow.Notifications.Domain.Events;

public record StockUpdatedEvent(
    Guid ProductId,
    string ProductName,
    int PreviousStock,
    int NewStock,
    bool IsLowStock,
    DateTime UpdatedAt
);