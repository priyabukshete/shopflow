using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetAllProductsQuery() : IRequest<IEnumerable<ProductDto>>;