using MediatR;
using ShopFlow.Orders.Application.DTOs;

namespace ShopFlow.Orders.Application.Commands;

public record PlaceOrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice);

public record PlaceOrderCommand(
    string OrderType,           // "WalkIn", "Pickup", "Delivery"
    string CreatedBy,
    string? CustomerName,
    string? CustomerPhone,
    List<PlaceOrderItemDto> Items
) : IRequest<OrderDto>;