using Microsoft.EntityFrameworkCore;
using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Enums;
using ShopFlow.Inventory.Domain.Interfaces;
using ShopFlow.Inventory.Infrastructure.Persistence;

namespace ShopFlow.Inventory.Infrastructure.Repositories;

public class StockMovementRepository : IStockMovementRepository
{
    private readonly InventoryDbContext _context;

    public StockMovementRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<StockMovement?> GetByIdAsync(Guid id) =>
        await _context.StockMovements
            .Include(s => s.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<StockMovement>> GetByProductIdAsync(Guid productId) =>
        await _context.StockMovements
            .Include(s => s.Product)
            .Where(s => s.ProductId == productId)
            .OrderByDescending(s => s.RecordedAt)
            .ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetByDateRangeAsync(DateTime from, DateTime to) =>
        await _context.StockMovements
            .Include(s => s.Product)
            .Where(s => s.RecordedAt >= from && s.RecordedAt <= to)
            .OrderByDescending(s => s.RecordedAt)
            .ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetByTypeAsync(StockMovementType type, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.StockMovements
            .Include(s => s.Product)
            .Where(s => s.Type == type);

        if (from.HasValue)
            query = query.Where(s => s.RecordedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.RecordedAt <= to.Value);

        return await query.OrderByDescending(s => s.RecordedAt).ToListAsync();
    }

    public async Task<int> CalculateCurrentStockAsync(Guid productId) =>
        await _context.StockMovements
            .Where(s => s.ProductId == productId)
            .SumAsync(s => s.Quantity);

    public async Task AddAsync(StockMovement movement)
    {
        await _context.StockMovements.AddAsync(movement);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetRecentAsync(int limit = 50) =>
    await _context.StockMovements
        .Include(s => s.Product)
        .OrderByDescending(s => s.RecordedAt)
        .Take(limit)
        .ToListAsync();
}