using ShopFlow.Orders.Domain.Enums;
using ShopFlow.Orders.Domain.Exceptions;

namespace ShopFlow.Orders.Domain.Entities;

public class Order
{
    public Guid Id { get; private set; }
    public string OrderNumber { get; private set; } = string.Empty;
    public string? CustomerName { get; private set; }
    public string? CustomerPhone { get; private set; }
    public decimal TotalAmount { get; private set; }
    public OrderStatus Status { get; private set; }
    public OrderType Type { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    // EF Core
    private Order() { }

    public static Order Create(
        string orderNumber,
        OrderType type,
        string createdBy,
        string? customerName = null,
        string? customerPhone = null)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            throw new DomainException("Order number is required");
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new DomainException("CreatedBy is required");

        // Validation: Delivery and Pickup need customer info
        if (type == OrderType.Delivery && string.IsNullOrWhiteSpace(customerPhone))
            throw new DomainException("Customer phone is required for delivery orders");

        return new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            CustomerName = customerName,
            CustomerPhone = customerPhone,
            Type = type,
            CreatedBy = createdBy,
            // WalkIn orders are auto-confirmed (cashier already at counter)
            Status = type == OrderType.WalkIn ? OrderStatus.Confirmed : OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ConfirmedAt = type == OrderType.WalkIn ? DateTime.UtcNow : null,
            TotalAmount = 0
        };
    }

    public void AddItem(Guid productId, string productName, int quantity, decimal unitPrice)
    {
        if (Status == OrderStatus.Cancelled || Status == OrderStatus.Completed)
            throw new DomainException("Cannot add items to a cancelled or completed order");

        var item = OrderItem.Create(productId, productName, quantity, unitPrice);
        _items.Add(item);
        RecalculateTotal();
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException($"Cannot confirm order in {Status} status");
        if (!_items.Any())
            throw new DomainException("Cannot confirm empty order");

        Status = OrderStatus.Confirmed;
        ConfirmedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Cancelled)
            throw new DomainException("Order is already cancelled");
        if (Status == OrderStatus.Completed)
            throw new DomainException("Cannot cancel completed order");

        // Business rule: cancellation within 24 hours of confirmation
        if (ConfirmedAt.HasValue && (DateTime.UtcNow - ConfirmedAt.Value).TotalHours > 24)
            throw new DomainException("Cannot cancel order more than 24 hours after confirmation");

        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Cancellation reason is required");

        Status = OrderStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason;
    }

    public void Complete()
    {
        if (Status != OrderStatus.Confirmed)
            throw new DomainException($"Cannot complete order in {Status} status");

        Status = OrderStatus.Completed;
    }

    private void RecalculateTotal()
    {
        TotalAmount = _items.Sum(i => i.LineTotal);
    }
}