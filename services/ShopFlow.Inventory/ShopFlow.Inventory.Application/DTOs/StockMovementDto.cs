namespace ShopFlow.Inventory.Application.DTOs;

public record StockMovementDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string Type,           // string for readability in API
    int Quantity,
    string Reference,
    string? Notes,
    DateTime RecordedAt,
    string RecordedBy
);