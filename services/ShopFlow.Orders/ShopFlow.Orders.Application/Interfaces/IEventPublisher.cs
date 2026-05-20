namespace ShopFlow.Orders.Application.Interfaces;

public interface IEventPublisher
{
    Task PublishAsync<T>(string topic, T eventData);
}