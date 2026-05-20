using MediatR;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetAllProductsHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync();
        return products.Select(p => p.ToDto());
    }
}