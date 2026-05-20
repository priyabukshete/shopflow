using Microsoft.EntityFrameworkCore;
using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Interfaces;
using ShopFlow.Inventory.Infrastructure.Persistence;

namespace ShopFlow.Inventory.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly InventoryDbContext _context;

    public ProductRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id) =>
        await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Product>> GetAllAsync() =>
        await _context.Products
            .Include(p => p.Category)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetByCategoryAsync(Guid categoryId) =>
        await _context.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync() =>
        await _context.Products
            .Include(p => p.Category)
            .Where(p => p.CurrentStock <= p.LowStockThreshold)
            .ToListAsync();

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Product product)
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string name) =>
        await _context.Products.AnyAsync(p => p.Name == name);
}