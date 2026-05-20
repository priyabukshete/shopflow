using System.Text.Json;
using Confluent.Kafka;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ShopFlow.Inventory.Application.Commands;
using ShopFlow.Inventory.Domain.Enums;
using ShopFlow.Inventory.Domain.Events.External;

namespace ShopFlow.Inventory.Infrastructure.Kafka;

public class OrderEventsConsumer : BackgroundService
{
    private readonly ILogger<OrderEventsConsumer> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConsumer<string, string> _consumer;

    public OrderEventsConsumer(
        IConfiguration configuration,
        ILogger<OrderEventsConsumer> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;

        var config = new ConsumerConfig
        {
            BootstrapServers = configuration["Kafka:BootstrapServers"],
            GroupId = "inventory-service-orders-consumer",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        _consumer = new ConsumerBuilder<string, string>(config).Build();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run in background to not block startup
        return Task.Run(() => RunConsumer(stoppingToken), stoppingToken);
    }

    private async Task RunConsumer(CancellationToken stoppingToken)
    {
        // Wait a few seconds for Kafka to be ready
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        _consumer.Subscribe(new[] { "order.placed", "order.cancelled" });
        _logger.LogInformation("📥 Inventory consumer subscribed to 'order.placed' and 'order.cancelled'");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = _consumer.Consume(stoppingToken);
                if (result?.Message == null) continue;

                _logger.LogInformation(
                    "📨 Received event from topic '{Topic}' (partition {Partition}, offset {Offset})",
                    result.Topic, result.Partition.Value, result.Offset.Value
                );

                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                if (result.Topic == "order.placed")
                {
                    await HandleOrderPlaced(result.Message.Value, mediator);
                }
                else if (result.Topic == "order.cancelled")
                {
                    await HandleOrderCancelled(result.Message.Value, mediator);
                }

                _consumer.Commit(result);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Inventory consumer stopping...");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing event");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        _consumer.Close();
    }

    private async Task HandleOrderPlaced(string message, IMediator mediator)
    {
        var orderEvent = JsonSerializer.Deserialize<OrderPlacedEvent>(message);
        if (orderEvent == null) return;

        _logger.LogInformation(
            "🛒 Processing order '{OrderNumber}' with {ItemCount} items — deducting stock",
            orderEvent.OrderNumber, orderEvent.Items.Count
        );

        foreach (var item in orderEvent.Items)
        {
            try
            {
                await mediator.Send(new RecordStockMovementCommand(
                    item.ProductId,
                    StockMovementType.Sale,
                    item.Quantity,
                    $"Order {orderEvent.OrderNumber}",
                    "System (Order Event)",
                    $"Auto-deducted from order {orderEvent.OrderNumber}"
                ));

                _logger.LogInformation(
                    "  ✅ Sale recorded: -{Quantity} × {ProductName}",
                    item.Quantity, item.ProductName
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "  ❌ Failed to deduct stock for product {ProductId}: {Error}",
                    item.ProductId, ex.Message
                );
                // Continue with next item — don't fail entire order
            }
        }
    }

    private async Task HandleOrderCancelled(string message, IMediator mediator)
    {
        var cancelEvent = JsonSerializer.Deserialize<OrderCancelledEvent>(message);
        if (cancelEvent == null) return;

        _logger.LogInformation(
            "↩️ Processing cancellation for order '{OrderNumber}' — returning stock",
            cancelEvent.OrderNumber
        );

        foreach (var item in cancelEvent.ItemsToReturn)
        {
            try
            {
                await mediator.Send(new RecordStockMovementCommand(
                    item.ProductId,
                    StockMovementType.Return,
                    item.Quantity,
                    $"Cancellation of {cancelEvent.OrderNumber}",
                    "System (Order Event)",
                    $"Stock returned due to cancellation: {cancelEvent.Reason}"
                ));

                _logger.LogInformation(
                    "  ✅ Return recorded: +{Quantity} × {ProductName}",
                    item.Quantity, item.ProductName
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "  ❌ Failed to return stock for product {ProductId}: {Error}",
                    item.ProductId, ex.Message
                );
            }
        }
    }

    public override void Dispose()
    {
        _consumer?.Dispose();
        base.Dispose();
    }
}