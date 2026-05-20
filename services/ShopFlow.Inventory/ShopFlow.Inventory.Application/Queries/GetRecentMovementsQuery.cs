using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetRecentMovementsQuery(int Limit = 50) : IRequest<IEnumerable<StockMovementDto>>;