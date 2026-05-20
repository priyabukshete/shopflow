using MediatR;
using ShopFlow.Inventory.Application.DTOs;

namespace ShopFlow.Inventory.Application.Queries;

public record GetProductByIdQuery(Guid Id) : IRequest<ProductDto?>;