using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetProductMovementsQuery(Guid ProductId) : IRequest<IEnumerable<StockMovementDto>>;