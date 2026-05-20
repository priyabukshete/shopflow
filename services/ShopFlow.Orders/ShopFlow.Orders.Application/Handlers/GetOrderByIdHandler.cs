using MediatR;
using ShopFlow.Orders.Application.Common;
using ShopFlow.Orders.Application.DTOs;
using ShopFlow.Orders.Application.Queries;
using ShopFlow.Orders.Domain.Interfaces;

namespace ShopFlow.Orders.Application.Handlers;

public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderByIdHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId);
        return order?.ToDto();
    }
}