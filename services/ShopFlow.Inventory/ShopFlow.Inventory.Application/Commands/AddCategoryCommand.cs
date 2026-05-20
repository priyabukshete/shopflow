using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Commands;

public record AddCategoryCommand(
    string Name,
    string Description
) : IRequest<CategoryDto>;