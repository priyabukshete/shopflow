using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Domain.Entities;

namespace ShopFlow.Inventory.Application.Common;

public static class MappingExtensions
{
    public static ProductDto ToDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Description,
        product.Price,
        product.CurrentStock,
        product.LowStockThreshold,
        product.IsLowStock(),
        product.CategoryId,
        product.Category?.Name ?? string.Empty,
        product.IsActive,
        product.CreatedAt,
        product.UpdatedAt
    );

    public static CategoryDto ToDto(this Category category) => new(
        category.Id,
        category.Name,
        category.Description,
        category.IsActive,
        category.CreatedAt
    );

    public static StockMovementDto ToDto(this StockMovement movement) => new(
        movement.Id,
        movement.ProductId,
        movement.Product?.Name ?? string.Empty,
        movement.Type.ToString(),
        movement.Quantity,
        movement.Reference,
        movement.Notes,
        movement.RecordedAt,
        movement.RecordedBy
    );
}