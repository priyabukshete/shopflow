using MediatR;
using ShopFlow.Orders.Application.DTOs;

namespace ShopFlow.Orders.Application.Commands;

public record CancelOrderCommand(Guid OrderId, string Reason) : IRequest<OrderDto>;