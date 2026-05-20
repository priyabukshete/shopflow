namespace ShopFlow.Inventory.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public decimal Price { get; private set; }
    public int CurrentStock { get; private set; }            // cached value
    public int LowStockThreshold { get; private set; }
    public Guid CategoryId { get; private set; }
    public Category Category { get; private set; } = null!;
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Product()
    {
        Name = string.Empty;
        Description = string.Empty;
    }

    public static Product Create(
        string name,
        string description,
        decimal price,
        int initialStock,
        int lowStockThreshold,
        Guid categoryId)
    {
        if (price < 0)
            throw new ArgumentException("Price cannot be negative");

        if (initialStock < 0)
            throw new ArgumentException("Initial stock cannot be negative");

        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Price = price,
            CurrentStock = initialStock,
            LowStockThreshold = lowStockThreshold,
            CategoryId = categoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string description, decimal price, int lowStockThreshold)
    {
        Name = name;
        Description = description;
        Price = price;
        LowStockThreshold = lowStockThreshold;
        UpdatedAt = DateTime.UtcNow;
    }

    // Called after a StockMovement is created
    public void RecalculateStock(int newStock)
    {
        if (newStock < 0)
            throw new InvalidOperationException("Cannot have negative stock");

        CurrentStock = newStock;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasSufficientStock(int requiredQuantity) =>
        CurrentStock >= requiredQuantity;

    public bool IsLowStock() => CurrentStock <= LowStockThreshold;

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}