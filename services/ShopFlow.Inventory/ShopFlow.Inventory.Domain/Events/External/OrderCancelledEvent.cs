namespace ShopFlow.Inventory.Domain.Events.External;

public record OrderCancelledEvent(
    Guid OrderId,
    string OrderNumber,
    List<OrderItemEventData> ItemsToReturn,
    string Reason,
    DateTime CancelledAt
);