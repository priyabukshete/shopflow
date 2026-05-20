using MediatR;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Queries;
using ShopFlow.Orders.Domain.Enums;
using ShopFlow.Orders.Domain.Exceptions;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class GetOrdersByStatusHandler : IRequestHandler<GetOrdersByStatusQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrdersByStatusHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetOrdersByStatusQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            throw new DomainException($"Invalid status: {request.Status}");

        var orders = await _orderRepository.GetByStatusAsync(status);
        return orders.Select(o => o.ToDto());
    }
}