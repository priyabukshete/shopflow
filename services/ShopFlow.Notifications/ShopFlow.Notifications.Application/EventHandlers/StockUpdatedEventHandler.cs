using Microsoft.Extensions.Logging;
using ShopFlow.Notifications.Domain.Events;

namespace ShopFlow.Notifications.Application.EventHandlers;

public class StockUpdatedEventHandler
{
    private readonly ILogger<StockUpdatedEventHandler> _logger;

    public StockUpdatedEventHandler(ILogger<StockUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task HandleAsync(StockUpdatedEvent @event)
    {
        var change = @event.NewStock - @event.PreviousStock;
        var direction = change > 0 ? "📈 +" : "📉 ";

        _logger.LogInformation(
            "📦 STOCK CHANGED for '{Name}'\n" +
            "   {Previous} → {New} ({Direction}{Change})\n" +
            "   Low stock alert: {LowStock}",
            @event.ProductName, @event.PreviousStock, @event.NewStock,
            direction, change, @event.IsLowStock);

        if (@event.IsLowStock)
        {
            _logger.LogWarning(
                "⚠️ LOW STOCK ALERT! '{Name}' has only {Stock} items left!",
                @event.ProductName, @event.NewStock);
        }

        return Task.CompletedTask;
    }
}