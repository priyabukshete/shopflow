namespace ShopFlow.Inventory.Domain.Events.External;

public record OrderPlacedEvent(
    Guid OrderId,
    string OrderNumber,
    List<OrderItemEventData> Items,
    decimal TotalAmount,
    string OrderType,
    DateTime PlacedAt
);

public record OrderItemEventData(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice
);