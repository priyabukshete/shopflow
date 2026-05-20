using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ShopFlow.Notifications.Application.EventHandlers;
using ShopFlow.Notifications.Domain.Events;

namespace ShopFlow.Notifications.Infrastructure.Kafka;

public class KafkaConsumerService : BackgroundService
{
    private readonly ILogger<KafkaConsumerService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConsumer<string, string> _consumer;
    private readonly string[] _topics = { "product.added", "stock.updated" };

    public KafkaConsumerService(
        IConfiguration configuration,
        ILogger<KafkaConsumerService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;

        var config = new ConsumerConfig
        {
            BootstrapServers = configuration["Kafka:BootstrapServers"],
            GroupId = "notifications-service",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        _consumer = new ConsumerBuilder<string, string>(config).Build();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe(_topics);
        _logger.LogInformation("🎧 Notifications service is listening to topics: {Topics}", string.Join(", ", _topics));

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var result = _consumer.Consume(stoppingToken);
                    if (result?.Message == null) continue;

                    _logger.LogInformation(
                        "📨 Received event from topic '{Topic}' | Key: {Key}",
                        result.Topic, result.Message.Key);

                    await HandleMessageAsync(result.Topic, result.Message.Value);
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(ex, "Kafka consume error");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message");
                }
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Consumer stopping...");
        }
        finally
        {
            _consumer.Close();
        }
    }

    private async Task HandleMessageAsync(string topic, string message)
    {
        using var scope = _scopeFactory.CreateScope();

        switch (topic)
        {
            case "product.added":
                var productEvent = JsonSerializer.Deserialize<ProductAddedEvent>(message);
                if (productEvent != null)
                {
                    var handler = scope.ServiceProvider.GetRequiredService<ProductAddedEventHandler>();
                    await handler.HandleAsync(productEvent);
                }
                break;

            case "stock.updated":
                var stockEvent = JsonSerializer.Deserialize<StockUpdatedEvent>(message);
                if (stockEvent != null)
                {
                    var handler = scope.ServiceProvider.GetRequiredService<StockUpdatedEventHandler>();
                    await handler.HandleAsync(stockEvent);
                }
                break;

            default:
                _logger.LogWarning("Unknown topic: {Topic}", topic);
                break;
        }
    }

    public override void Dispose()
    {
        _consumer?.Dispose();
        base.Dispose();
    }
}