using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Domain.Entities;

namespace ShopFlow.Orders.Application.Common;

public static class OrderMapper
{
    public static OrderDto ToDto(this Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            order.CustomerName,
            order.CustomerPhone,
            order.TotalAmount,
            order.Status.ToString(),
            order.Type.ToString(),
            order.CreatedAt,
            order.ConfirmedAt,
            order.CancelledAt,
            order.CancellationReason,
            order.CreatedBy,
            order.Items.Select(i => new OrderItemDto(
                i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.LineTotal
            ))
        );
}