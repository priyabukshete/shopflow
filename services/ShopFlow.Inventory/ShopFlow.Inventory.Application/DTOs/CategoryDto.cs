namespace ShopFlow.Inventory.Application.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string Description,
    bool IsActive,
    DateTime CreatedAt
);