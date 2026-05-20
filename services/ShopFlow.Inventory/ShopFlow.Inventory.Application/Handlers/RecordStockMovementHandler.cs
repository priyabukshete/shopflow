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

public class RecordStockMovementHandler : IRequestHandler<RecordStockMovementCommand, StockMovementDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IStockMovementRepository _movementRepository;
    private readonly IEventPublisher _eventPublisher;

    public RecordStockMovementHandler(
        IProductRepository productRepository,
        IStockMovementRepository movementRepository,
        IEventPublisher eventPublisher)
    {
        _productRepository = productRepository;
        _movementRepository = movementRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<StockMovementDto> Handle(RecordStockMovementCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId)
            ?? throw new DomainException("Product not found");

        var previousStock = product.CurrentStock;

        // Create the stock movement
        var movement = StockMovement.Create(
            request.ProductId,
            request.Type,
            request.Quantity,
            request.Reference,
            request.RecordedBy,
            request.Notes
        );

        // Check if stock would go negative for outbound movements
        var newStock = previousStock + movement.Quantity;
        if (newStock < 0)
            throw new DomainException(
                $"Insufficient stock. Current: {previousStock}, attempted to deduct: {Math.Abs(movement.Quantity)}");

        await _movementRepository.AddAsync(movement);

        // Update product's cached stock
        product.RecalculateStock(newStock);
        await _productRepository.UpdateAsync(product);

        // 🚀 Publish event
        var @event = new StockUpdatedEvent(
            product.Id,
            product.Name,
            previousStock,
            product.CurrentStock,
            product.IsLowStock(),
            DateTime.UtcNow
        );

        await _eventPublisher.PublishAsync("stock.updated", product.Id.ToString(), @event);

        // Re-fetch with Product included for proper DTO mapping
        var savedMovement = await _movementRepository.GetByIdAsync(movement.Id);
        return savedMovement!.ToDto();
    }
}