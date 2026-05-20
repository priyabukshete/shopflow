using MediatR;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Queries;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class GetAllOrdersHandler : IRequestHandler<GetAllOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAllOrdersHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAllAsync();
        return orders.Select(o => o.ToDto());
    }
}