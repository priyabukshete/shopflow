using MediatR;
using ShopFlow.Orders.Application.DTOs;

namespace ShopFlow.Orders.Application.Queries;

public record GetAllOrdersQuery : IRequest<IEnumerable<OrderDto>>;