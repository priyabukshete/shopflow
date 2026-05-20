using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Enums;

namespace ShopFlow.Inventory.Domain.Interfaces;

public interface IStockMovementRepository
{
    Task<StockMovement?> GetByIdAsync(Guid id);
    Task<IEnumerable<StockMovement>> GetByProductIdAsync(Guid productId);
    Task<IEnumerable<StockMovement>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<IEnumerable<StockMovement>> GetByTypeAsync(StockMovementType type, DateTime? from = null, DateTime? to = null);
    Task<int> CalculateCurrentStockAsync(Guid productId);
    Task AddAsync(StockMovement movement);
    Task<IEnumerable<StockMovement>> GetRecentAsync(int limit = 50);
}