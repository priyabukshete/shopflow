using MediatR;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Exceptions;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class AddCategoryHandler : IRequestHandler<AddCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;

    public AddCategoryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<CategoryDto> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
    {
        if (await _categoryRepository.ExistsAsync(request.Name))
            throw new DomainException($"Category '{request.Name}' already exists");

        var category = Category.Create(request.Name, request.Description);
        await _categoryRepository.AddAsync(category);
        return category.ToDto();
    }
}