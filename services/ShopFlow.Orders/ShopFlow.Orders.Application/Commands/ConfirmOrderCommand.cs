using MediatR;
using ShopFlow.Orders.Application.DTOs;

namespace ShopFlow.Orders.Application.Commands;

public record ConfirmOrderCommand(Guid OrderId) : IRequest<OrderDto>;