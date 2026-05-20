namespace ShopFlow.Inventory.Application.Interfaces;

public interface IEventPublisher
{
    Task PublishAsync<T>(string topic, string key, T message);
}