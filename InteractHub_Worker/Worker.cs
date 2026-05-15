using InteractHub_Shared.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using InteractHub_Shared.Services;

namespace InteractHub_Worker;

// sealed: không cho phép bất kỳ Class nào khác kế thừa từ nó.
public sealed class RedisStreamWorker(
    IServiceScopeFactory scopeFactory,
    IConnectionMultiplexer redis,
    IConfiguration configuration,
    ILogger<RedisStreamWorker> logger) : BackgroundService
{
    private readonly string _streamKey = configuration["RedisStreams:Notifications:StreamKey"] ?? "interacthub:notifications:stream";
    private readonly string _groupName = configuration["RedisStreams:Notifications:GroupName"] ?? "interacthub-workers";
    private readonly string _consumerName = configuration["RedisStreams:Notifications:ConsumerName"] ?? Environment.MachineName;
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
                    position: ">", // lấy những cái mới nhất, mà chưa có bất kỳ ai trong nhóm này từng đọc
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
                    // StreamAcknowledgeAsync (XACK)
                    // Lệnh này chính thức đưa tin nhắn ra khỏi danh sách PEL (Pending Entries List) của Group.
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
                position: "0-0", // Lấy từ Offset đầu
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
        // 1. Trích xuất dữ liệu từ Redis Stream (được đẩy lên từ API qua lệnh XADD)
        var toUserId = GetField(entry, "toUserId");
        var senderId = GetField(entry, "senderId");
        var postId = GetField(entry, "postId");
        var type = GetField(entry, "notificationType"); // Ví dụ: FriendRequest, Like, Comment...

        if (string.IsNullOrEmpty(toUserId)) return;

        // 2. Sử dụng NotificationService từ Shared
        using var scope = scopeFactory.CreateAsyncScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        // 3. Thực thi logic: Lưu vào DB và Gửi Realtime (SignalR)
        // Phương thức này của bạn nên đảm nhiệm cả 2 việc: 
        // - Lưu bản ghi vào bảng Notifications trong SQL Server.
        // - Gọi HubContext để bắn SignalR nếu User đang online.
        await notificationService.CreateAndSendNotificationAsync(toUserId, senderId, postId, type);

        logger.LogInformation("[RedisStreamWorker] Đã xử lý thông báo {Type} cho User {User}", type, toUserId);
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
