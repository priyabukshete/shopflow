using MediatR;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Queries;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetAllCategoriesHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(c => c.ToDto());
    }
}