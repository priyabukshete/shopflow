using ShopFlow.Inventory.Domain.Enums;

namespace ShopFlow.Inventory.Domain.Entities;

public class StockMovement
{
    public Guid Id { get; private set; }
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public StockMovementType Type { get; private set; }
    public int Quantity { get; private set; }
    public string Reference { get; private set; }
    public string? Notes { get; private set; }
    public DateTime RecordedAt { get; private set; }
    public string RecordedBy { get; private set; }

    private StockMovement()
    {
        Reference = string.Empty;
        RecordedBy = string.Empty;
    }

    public static StockMovement Create(
        Guid productId,
        StockMovementType type,
        int quantity,
        string reference,
        string recordedBy,
        string? notes = null)
    {
        if (quantity == 0)
            throw new ArgumentException("Quantity cannot be zero");

        if (string.IsNullOrWhiteSpace(reference))
            throw new ArgumentException("Reference is required");

        // Ensure correct sign based on type
        var normalizedQuantity = NormalizeQuantity(type, quantity);

        return new StockMovement
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Type = type,
            Quantity = normalizedQuantity,
            Reference = reference,
            Notes = notes,
            RecordedAt = DateTime.UtcNow,
            RecordedBy = recordedBy
        };
    }

    // Ensures Delivery/Production/Return = positive, Sale/Waste/Transfer = negative
    private static int NormalizeQuantity(StockMovementType type, int quantity)
    {
        var absQty = Math.Abs(quantity);

        return type switch
        {
            StockMovementType.InitialStock => absQty,
            StockMovementType.Delivery => absQty,
            StockMovementType.Production => absQty,
            StockMovementType.Return => absQty,
            StockMovementType.Sale => -absQty,
            StockMovementType.Waste => -absQty,
            StockMovementType.Transfer => -absQty,
            StockMovementType.Adjustment => quantity, // can be + or -
            _ => quantity
        };
    }

    public bool IsInbound => Quantity > 0;
    public bool IsOutbound => Quantity < 0;
}