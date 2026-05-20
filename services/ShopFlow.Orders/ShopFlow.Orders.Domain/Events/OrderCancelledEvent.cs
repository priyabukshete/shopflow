namespace ShopFlow.Orders.Domain.Events;

public record OrderCancelledEvent(
    Guid OrderId,
    string OrderNumber,
    List<OrderItemEventData> ItemsToReturn,
    string Reason,
    DateTime CancelledAt
);