using MediatR;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetProductMovementsHandler : IRequestHandler<GetProductMovementsQuery, IEnumerable<StockMovementDto>>
{
    private readonly IStockMovementRepository _movementRepository;

    public GetProductMovementsHandler(IStockMovementRepository movementRepository)
    {
        _movementRepository = movementRepository;
    }

    public async Task<IEnumerable<StockMovementDto>> Handle(GetProductMovementsQuery request, CancellationToken cancellationToken)
    {
        var movements = await _movementRepository.GetByProductIdAsync(request.ProductId);
        return movements.Select(m => m.ToDto());
    }
}