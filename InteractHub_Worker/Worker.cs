using InteractHub_Shared.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace InteractHub_Worker;

public sealed class RedisStreamWorker(
    IServiceScopeFactory scopeFactory,
    IConnectionMultiplexer redis,
    IConfiguration configuration,
    ILogger<RedisStreamWorker> logger) : BackgroundService
{
    private readonly string _streamKey = configuration["RedisStreams:Notifications:StreamKey"] ?? "interacthub:notifications:stream";
    private readonly string _groupName = configuration["RedisStreams:Notifications:GroupName"] ?? "interacthub-workers";
    private readonly string _consumerName = configuration["RedisStreams:Notifications:ConsumerName"] ?? "worker-1";
    private readonly int _batchSize = configuration.GetValue("RedisStreams:Notifications:BatchSize", 20);
    private readonly int _idleDelayMs = configuration.GetValue("RedisStreams:Notifications:IdleDelayMs", 1500);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[RedisStreamWorker] Starting. Stream={Stream} Group={Group} Consumer={Consumer}",
            _streamKey, _groupName, _consumerName);

        await EnsureConsumerGroupAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var entries = await redis.GetDatabase().StreamReadGroupAsync(
                    key: _streamKey,
                    groupName: _groupName,
                    consumerName: _consumerName,
                    position: ">",
                    count: _batchSize);

                if (entries.Length == 0)
                {
                    await Task.Delay(_idleDelayMs, stoppingToken);
                    continue;
                }

                await using var scope = scopeFactory.CreateAsyncScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                foreach (var entry in entries)
                {
                    await ProcessEntryAsync(dbContext, entry, stoppingToken);
                    await redis.GetDatabase().StreamAcknowledgeAsync(_streamKey, _groupName, entry.Id);
                }
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("[RedisStreamWorker] Cancellation requested. Stopping worker.");
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[RedisStreamWorker] Unexpected error while processing stream. Retrying shortly.");
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
        }

        logger.LogInformation("[RedisStreamWorker] Stopped.");
    }

    private async Task EnsureConsumerGroupAsync()
    {
        try
        {
            await redis.GetDatabase().StreamCreateConsumerGroupAsync(
                key: _streamKey,
                groupName: _groupName,
                position: "0-0",
                createStream: true);
        }
        catch (RedisServerException ex) when (ex.Message.Contains("BUSYGROUP", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogDebug("[RedisStreamWorker] Consumer group {Group} already exists for stream {Stream}.",
                _groupName, _streamKey);
        }
    }

    private async Task ProcessEntryAsync(AppDbContext dbContext, StreamEntry entry, CancellationToken cancellationToken)
    {
        var eventType = GetField(entry, "eventType") ?? "unknown";
        var notificationId = GetField(entry, "notificationId");

        if (!string.IsNullOrWhiteSpace(notificationId))
        {
            _ = await dbContext.Notifications
                .AsNoTracking()
                .AnyAsync(n => n.IdNotification == notificationId, cancellationToken);
        }

        logger.LogInformation("[RedisStreamWorker] Processed entry {EntryId} (eventType={EventType}).",
            entry.Id, eventType);
    }

    private static string? GetField(StreamEntry entry, string fieldName)
    {
        foreach (var item in entry.Values)
        {
            if (item.Name == fieldName)
            {
                return item.Value;
            }
        }

        return null;
    }
}
