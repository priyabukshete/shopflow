using Microsoft.Extensions.Logging;
using ShopFlow.Notifications.Domain.Events;

namespace ShopFlow.Notifications.Application.EventHandlers;

public class ProductAddedEventHandler
{
    private readonly ILogger<ProductAddedEventHandler> _logger;

    public ProductAddedEventHandler(ILogger<ProductAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task HandleAsync(ProductAddedEvent @event)
    {
        _logger.LogInformation(
            "🎁 NEW PRODUCT ADDED!\n" +
            "   Name: {Name}\n" +
            "   Price: CHF {Price}\n" +
            "   Initial Stock: {Stock}\n" +
            "   At: {Time}",
            @event.ProductName, @event.Price, @event.InitialStock, @event.AddedAt);

        // Later: send email, push notification, update analytics, etc.
        return Task.CompletedTask;
    }
}