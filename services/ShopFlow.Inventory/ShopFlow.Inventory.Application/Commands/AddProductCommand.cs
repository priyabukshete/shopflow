using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Commands;

public record AddProductCommand(
    string Name,
    string Description,
    decimal Price,
    int InitialStock,                        // ← was StockQuantity
    int LowStockThreshold,
    Guid CategoryId
) : IRequest<ProductDto>;