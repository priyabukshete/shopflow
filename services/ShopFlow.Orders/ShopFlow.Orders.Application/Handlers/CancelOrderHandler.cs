using MediatR;
using ShopFlow.Orders.Application.Commands;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Interfaces;
using ShopFlow.Orders.Domain.Events;
using ShopFlow.Orders.Domain.Exceptions;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class CancelOrderHandler : IRequestHandler<CancelOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEventPublisher _eventPublisher;

    public CancelOrderHandler(IOrderRepository orderRepository, IEventPublisher eventPublisher)
    {
        _orderRepository = orderRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<OrderDto> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId)
            ?? throw new DomainException("Order not found");

        order.Cancel(request.Reason);
        await _orderRepository.UpdateAsync(order);

        // 📡 Publish event → Inventory should return stock!
        var cancelledEvent = new OrderCancelledEvent(
            order.Id,
            order.OrderNumber,
            order.Items.Select(i => new OrderItemEventData(
                i.ProductId, i.ProductName, i.Quantity, i.UnitPrice
            )).ToList(),
            request.Reason,
            order.CancelledAt!.Value
        );

        await _eventPublisher.PublishAsync("order.cancelled", cancelledEvent);

        return order.ToDto();
    }
}