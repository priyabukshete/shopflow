namespace ShopFlow.Orders.Domain.Events;

public record OrderConfirmedEvent(
    Guid OrderId,
    string OrderNumber,
    DateTime ConfirmedAt
);