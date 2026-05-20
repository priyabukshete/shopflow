using Microsoft.EntityFrameworkCore;
using ShopFlow.Inventory.Domain.Entities;
using ShopFlow.Inventory.Domain.Interfaces;
using ShopFlow.Inventory.Infrastructure.Persistence;

namespace ShopFlow.Inventory.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly InventoryDbContext _context;

    public CategoryRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(Guid id) =>
        await _context.Categories.FindAsync(id);

    public async Task<IEnumerable<Category>> GetAllAsync() =>
        await _context.Categories.ToListAsync();

    public async Task AddAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string name) =>
        await _context.Categories.AnyAsync(c => c.Name == name);
}