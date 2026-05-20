using ShopFlow.Orders.Domain.Exceptions;

namespace ShopFlow.Orders.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal LineTotal => Quantity * UnitPrice;

    // EF Core
    private OrderItem() { }

    public static OrderItem Create(Guid productId, string productName, int quantity, decimal unitPrice)
    {
        if (productId == Guid.Empty)
            throw new DomainException("Product ID is required");
        if (string.IsNullOrWhiteSpace(productName))
            throw new DomainException("Product name is required");
        if (quantity <= 0)
            throw new DomainException("Quantity must be greater than zero");
        if (unitPrice < 0)
            throw new DomainException("Unit price cannot be negative");

        return new OrderItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductName = productName,
            Quantity = quantity,
            UnitPrice = unitPrice
        };
    }
}