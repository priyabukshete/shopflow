using ShopFlow.Orders.Domain.Entities;
using ShopFlow.Orders.Domain.Enums;

namespace ShopFlow.Orders.Domain.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<IEnumerable<Order>> GetAllAsync();
    Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status);
    Task<int> CountByDateAsync(DateTime date);
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
}