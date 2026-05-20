using MediatR;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Domain.Enums;

namespace ShopFlow.Inventory.Application.Commands;

public record RecordStockMovementCommand(
    Guid ProductId,
    StockMovementType Type,
    int Quantity,
    string Reference,
    string RecordedBy,
    string? Notes = null
) : IRequest<StockMovementDto>;