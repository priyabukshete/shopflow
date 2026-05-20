using MediatR;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetLowStockProductsHandler : IRequestHandler<GetLowStockProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetLowStockProductsHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetLowStockProductsAsync();
        return products.Select(p => p.ToDto());
    }
}