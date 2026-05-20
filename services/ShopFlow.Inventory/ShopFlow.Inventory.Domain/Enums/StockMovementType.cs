namespace ShopFlow.Inventory.Domain.Enums;

public enum StockMovementType
{
    InitialStock = 1,    // First time product added
    Delivery = 2,    // Supplier brought goods
    Production = 3,    // In-house bakery made it 🥖
    Sale = 4,    // Sold at cash counter
    Return = 5,    // Customer returned
    Waste = 6,    // Expired/spoiled
    Adjustment = 7,    // Manual fix (counting error)
    Transfer = 8     // Moved between stores
}