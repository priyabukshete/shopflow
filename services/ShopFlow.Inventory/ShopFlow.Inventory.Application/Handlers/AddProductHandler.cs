using MediatR;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Application.Common;
using ShopFlow.Inventory.Application.DTOs;
using ShopFlow.Inventory.Application.Interfaces;
using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Events;
using ShopFlow.Inventory.Domain.Exceptions;
using ShopFlow.Inventory.Domain.Interfaces;

namespace ShopFlow.Inventory.Application.Handlers;

public class AddProductHandler : IRequestHandler<AddProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IEventPublisher _eventPublisher;

    public AddProductHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IEventPublisher eventPublisher)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<ProductDto> Handle(AddProductCommand request, CancellationToken cancellationToken)
    {
        if (await _productRepository.ExistsAsync(request.Name))
            throw new DomainException($"Product '{request.Name}' already exists");

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId)
            ?? throw new DomainException("Category not found");

        var product = Product.Create(
            request.Name,
            request.Description,
            request.Price,
            request.InitialStock,
            request.LowStockThreshold,
            request.CategoryId
        );

        await _productRepository.AddAsync(product);

        // 🚀 Publish Kafka event
        var @event = new ProductAddedEvent(
            product.Id,
            product.Name,
            product.Price,
            product.CurrentStock,
            product.CategoryId,
            DateTime.UtcNow
        );

        await _eventPublisher.PublishAsync("product.added", product.Id.ToString(), @event);

        return product.ToDto();
    }
}