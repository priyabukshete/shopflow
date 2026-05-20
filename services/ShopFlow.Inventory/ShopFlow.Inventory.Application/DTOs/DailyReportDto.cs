namespace ShopFlow.Inventory.Application.DTOs;

public record DailyReportDto(
    DateTime Date,
    IEnumerable<ProductDailyMovementDto> Products
);

public record ProductDailyMovementDto(
    Guid ProductId,
    string ProductName,
    int Delivered,
    int Produced,
    int Sold,
    int Wasted,
    int Returned,
    int CurrentStock
);