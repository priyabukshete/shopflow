using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ShopFlow.Orders.Application.Interfaces;

namespace ShopFlow.Orders.Infrastructure.Messaging;

public class KafkaEventPublisher : IEventPublisher, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaEventPublisher> _logger;

    public KafkaEventPublisher(IConfiguration configuration, ILogger<KafkaEventPublisher> logger)
    {
        _logger = logger;

        var bootstrapServers = configuration["Kafka:BootstrapServers"]
            ?? throw new InvalidOperationException("Kafka:BootstrapServers not configured");

        var config = new ProducerConfig
        {
            BootstrapServers = bootstrapServers,
            ClientId = "shopflow-orders-producer",
            Acks = Acks.All,                    // Wait for full acknowledgment
            EnableIdempotence = true,            // No duplicates
            MessageTimeoutMs = 10000
        };

        _producer = new ProducerBuilder<string, string>(config).Build();
        _logger.LogInformation("✅ Kafka producer initialized: {Servers}", bootstrapServers);
    }

    public async Task PublishAsync<T>(string topic, T eventData)
    {
        try
        {
            var json = JsonSerializer.Serialize(eventData);
            var key = Guid.NewGuid().ToString();

            var message = new Message<string, string>
            {
                Key = key,
                Value = json
            };

            var deliveryResult = await _producer.ProduceAsync(topic, message);

            _logger.LogInformation(
                "📤 Published event to topic '{Topic}' at partition {Partition}, offset {Offset}",
                deliveryResult.Topic,
                deliveryResult.Partition.Value,
                deliveryResult.Offset.Value
            );
        }
        catch (ProduceException<string, string> ex)
        {
            _logger.LogError(ex, "❌ Failed to publish event to topic '{Topic}': {Error}", topic, ex.Error.Reason);
            throw;
        }
    }

    public void Dispose()
    {
        _producer.Flush(TimeSpan.FromSeconds(5));
        _producer.Dispose();
    }
}