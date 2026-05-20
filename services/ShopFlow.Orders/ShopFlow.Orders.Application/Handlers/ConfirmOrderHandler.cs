using MediatR;
using ShopFlow.Orders.Application.Commands;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Interfaces;
using ShopFlow.Orders.Domain.Events;
using ShopFlow.Orders.Domain.Exceptions;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class ConfirmOrderHandler : IRequestHandler<ConfirmOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEventPublisher _eventPublisher;

    public ConfirmOrderHandler(IOrderRepository orderRepository, IEventPublisher eventPublisher)
    {
        _orderRepository = orderRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<OrderDto> Handle(ConfirmOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId)
            ?? throw new DomainException("Order not found");

        order.Confirm();
        await _orderRepository.UpdateAsync(order);

        var confirmedEvent = new OrderConfirmedEvent(order.Id, order.OrderNumber, order.ConfirmedAt!.Value);
        await _eventPublisher.PublishAsync("order.confirmed", confirmedEvent);

        return order.ToDto();
    }
}