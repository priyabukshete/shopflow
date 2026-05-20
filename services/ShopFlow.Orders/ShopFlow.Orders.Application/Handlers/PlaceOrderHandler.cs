using MediatR;
using ShopFlow.Orders.Application.Commands;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Interfaces;
using ShopFlow.Orders.Domain.Entities;
using ShopFlow.Orders.Domain.Enums;
using ShopFlow.Orders.Domain.Events;
using ShopFlow.Orders.Domain.Exceptions;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class PlaceOrderHandler : IRequestHandler<PlaceOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEventPublisher _eventPublisher;

    public PlaceOrderHandler(IOrderRepository orderRepository, IEventPublisher eventPublisher)
    {
        _orderRepository = orderRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<OrderDto> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderType>(request.OrderType, true, out var orderType))
            throw new DomainException($"Invalid order type: {request.OrderType}");

        if (request.Items == null || !request.Items.Any())
            throw new DomainException("Order must have at least one item");

        // Generate order number
        var today = DateTime.UtcNow.Date;
        var todayCount = await _orderRepository.CountByDateAsync(today);
        var orderNumber = OrderNumberGenerator.Generate(today, todayCount + 1);

        // Create order
        var order = Order.Create(orderNumber, orderType, request.CreatedBy, request.CustomerName, request.CustomerPhone);

        // Add items
        foreach (var item in request.Items)
        {
            order.AddItem(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice);
        }

        await _orderRepository.AddAsync(order);

        // 📡 Publish OrderPlacedEvent → Inventory will consume and deduct stock!
        var placedEvent = new OrderPlacedEvent(
            order.Id,
            order.OrderNumber,
            order.Items.Select(i => new OrderItemEventData(
                i.ProductId, i.ProductName, i.Quantity, i.UnitPrice
            )).ToList(),
            order.TotalAmount,
            order.Type.ToString(),
            order.CreatedAt
        );

        await _eventPublisher.PublishAsync("order.placed", placedEvent);

        return order.ToDto();
    }
}