using MediatR;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetRecentMovementsHandler : IRequestHandler<GetRecentMovementsQuery, IEnumerable<StockMovementDto>>
{
    private readonly IStockMovementRepository _movementRepository;

    public GetRecentMovementsHandler(IStockMovementRepository movementRepository)
    {
        _movementRepository = movementRepository;
    }

    public async Task<IEnumerable<StockMovementDto>> Handle(GetRecentMovementsQuery request, CancellationToken cancellationToken)
    {
        var movements = await _movementRepository.GetRecentAsync(request.Limit);
        return movements.Select(m => m.ToDto());
    }
}