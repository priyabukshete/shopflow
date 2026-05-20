using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetLowStockProductsQuery() : IRequest<IEnumerable<ProductDto>>;