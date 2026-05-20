using MediatR;
using ShopFlow.Orders.Application.DTOs;

namespace ShopFlow.Orders.Application.Queries;

public record GetOrdersByStatusQuery(string Status) : IRequest<IEnumerable<OrderDto>>;