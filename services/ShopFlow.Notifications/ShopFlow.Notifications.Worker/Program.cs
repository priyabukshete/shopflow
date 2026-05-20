using ShopFlow.Notifications.Application.EventHandlers;
using ShopFlow.Notifications.Infrastructure.Kafka;

var builder = Host.CreateApplicationBuilder(args);

// Register event handlers
builder.Services.AddScoped<ProductAddedEventHandler>();
builder.Services.AddScoped<StockUpdatedEventHandler>();

// Register the Kafka consumer as a background service
builder.Services.AddHostedService<KafkaConsumerService>();

var host = builder.Build();
host.Run();