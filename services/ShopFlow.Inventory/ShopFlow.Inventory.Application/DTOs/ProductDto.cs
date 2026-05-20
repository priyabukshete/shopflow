namespace ShopFlow.Inventory.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    int CurrentStock,                        // ← was StockQuantity
    int LowStockThreshold,
    bool IsLowStock,
    Guid CategoryId,
    string CategoryName,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);