namespace ShopFlow.Orders.Application.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    string? CustomerName,
    string? CustomerPhone,
    decimal TotalAmount,
    string Status,
    string Type,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    string? CancellationReason,
    string CreatedBy,
    IEnumerable<OrderItemDto> Items
);