using InteractHub_API.Agents.DTOs;
using InteractHub_API.Agents.Extensions;
using InteractHub_API.Agents.Services;
using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace InteractHub_API.UnitTests;

public class SkillServicesTests
{
    private readonly Mock<IConnectionMultiplexer> _mockRedis;
    private readonly Mock<IDatabase> _mockDatabase;
    private readonly Mock<ILogger<AnalyzePostPerformanceSkill>> _mockAnalyzeLogger;
    private readonly Mock<ILogger<SuggestOptimizationSkill>> _mockSuggestLogger;
    private readonly Mock<ILogger<GetTrendingTopicsSkill>> _mockTrendingLogger;
    private readonly Mock<ILogger<SkillRegistryLoader>> _mockRegistryLogger;

    public SkillServicesTests()
    {
        _mockRedis = new Mock<IConnectionMultiplexer>();
        _mockDatabase = new Mock<IDatabase>();
        _mockRedis.Setup(r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_mockDatabase.Object);

        _mockAnalyzeLogger = new Mock<ILogger<AnalyzePostPerformanceSkill>>();
        _mockSuggestLogger = new Mock<ILogger<SuggestOptimizationSkill>>();
        _mockTrendingLogger = new Mock<ILogger<GetTrendingTopicsSkill>>();
        _mockRegistryLogger = new Mock<ILogger<SkillRegistryLoader>>();
    }

    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task AnalyzePostPerformanceSkill_ThrowsArgumentException_WhenPostIdIsNullOrEmpty()
    {
        using var dbContext = GetInMemoryDbContext();
        var skill = new AnalyzePostPerformanceSkill(dbContext, _mockRedis.Object, _mockAnalyzeLogger.Object);

        await Assert.ThrowsAsync<ArgumentException>(() => skill.ExecuteAsync(""));
    }

    [Fact]
    public async Task AnalyzePostPerformanceSkill_ReturnsMetricsFromRedis_WhenKeysExist()
    {
        using var dbContext = GetInMemoryDbContext();
        var postId = "post-123";

        _mockDatabase.Setup(d => d.StringGetAsync($"post:{postId}:likes", It.IsAny<CommandFlags>()))
            .ReturnsAsync(new RedisValue("100"));
        _mockDatabase.Setup(d => d.StringGetAsync($"post:{postId}:comments", It.IsAny<CommandFlags>()))
            .ReturnsAsync(new RedisValue("20"));
        _mockDatabase.Setup(d => d.StringGetAsync($"post:{postId}:reposts", It.IsAny<CommandFlags>()))
            .ReturnsAsync(new RedisValue("5"));
        _mockDatabase.Setup(d => d.StringGetAsync($"post:{postId}:impressions", It.IsAny<CommandFlags>()))
            .ReturnsAsync(new RedisValue("1000"));

        var skill = new AnalyzePostPerformanceSkill(dbContext, _mockRedis.Object, _mockAnalyzeLogger.Object);

        var result = await skill.ExecuteAsync(postId);

        Assert.NotNull(result);
        Assert.Equal(100, result.Metrics.Likes);
        Assert.Equal(20, result.Metrics.Comments);
        Assert.Equal(5, result.Metrics.Reposts);
        Assert.Equal(1000, result.Metrics.Impressions);
        Assert.Equal("redis", result.RawSources.Likes.Source);
        Assert.Equal(0.125, result.Metrics.EngagementRate, 3);
    }

    [Fact]
    public async Task AnalyzePostPerformanceSkill_FallsBackToSql_WhenRedisKeysMissing()
    {
        using var dbContext = GetInMemoryDbContext();
        var postId = "sql-post-1";

        dbContext.Posts.Add(new Post
        {
            IdPost = postId,
            Content = "Test content",
            Likes = new List<Like>
            {
                new Like { IdTaiKhoan = "user1", IdPost = postId },
                new Like { IdTaiKhoan = "user2", IdPost = postId }
            },
            Comments = new List<Comment>
            {
                new Comment { IdComment = "c1", IdTaiKhoan = "user1", IdPost = postId, Content = "Great post!" }
            }
        });
        await dbContext.SaveChangesAsync();

        _mockDatabase.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(RedisValue.Null);

        var skill = new AnalyzePostPerformanceSkill(dbContext, _mockRedis.Object, _mockAnalyzeLogger.Object);

        var result = await skill.ExecuteAsync(postId);

        Assert.NotNull(result);
        Assert.Equal(2, result.Metrics.Likes);
        Assert.Equal(1, result.Metrics.Comments);
        Assert.Equal("sql", result.RawSources.Likes.Source);
    }

    [Fact]
    public async Task GetTrendingTopicsSkill_ReturnsEmpty_WhenNoTopicsInRedis()
    {
        _mockDatabase.Setup(d => d.SortedSetRangeByRankAsync(
            It.IsAny<RedisKey>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<Order>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(Array.Empty<RedisValue>());

        var skill = new GetTrendingTopicsSkill(_mockRedis.Object, _mockTrendingLogger.Object);

        var result = await skill.ExecuteAsync("tech", 10);

        Assert.NotNull(result);
        Assert.Empty(result.Topics);
    }

    [Fact]
    public async Task GetTrendingTopicsSkill_ReturnsTopicsWithScores_WhenRedisHasData()
    {
        var category = "tech";
        var redisKey = $"trending:{category}";
        var items = new RedisValue[] { "#AI", "#DotNet" };

        _mockDatabase.Setup(d => d.SortedSetRangeByRankAsync(
            redisKey, 0, 9, Order.Descending, It.IsAny<CommandFlags>()))
            .ReturnsAsync(items);

        _mockDatabase.Setup(d => d.SortedSetScoreAsync(redisKey, new RedisValue("#AI"), It.IsAny<CommandFlags>()))
            .ReturnsAsync(95.5);
        _mockDatabase.Setup(d => d.SortedSetScoreAsync(redisKey, new RedisValue("#DotNet"), It.IsAny<CommandFlags>()))
            .ReturnsAsync(80.0);

        var skill = new GetTrendingTopicsSkill(_mockRedis.Object, _mockTrendingLogger.Object);

        var result = await skill.ExecuteAsync(category, 10);

        Assert.NotNull(result);
        Assert.Equal(2, result.Topics.Count);
        Assert.Equal("#AI", result.Topics[0].Topic);
        Assert.Equal(95.5, result.Topics[0].Score);
    }

    [Fact]
    public async Task SuggestOptimizationSkill_ThrowsArgumentException_WhenContentIsEmpty()
    {
        var httpClient = new HttpClient();
        var config = new ConfigurationBuilder().Build();
        var skill = new SuggestOptimizationSkill(httpClient, config, _mockSuggestLogger.Object);

        await Assert.ThrowsAsync<ArgumentException>(() => skill.ExecuteAsync(""));
    }

    [Fact]
    public async Task SuggestOptimizationSkill_ReturnsEmptySuggestions_WhenApiKeyNotSet()
    {
        var httpClient = new HttpClient();
        var config = new ConfigurationBuilder().Build();
        var skill = new SuggestOptimizationSkill(httpClient, config, _mockSuggestLogger.Object);

        var result = await skill.ExecuteAsync("Hello world");

        Assert.NotNull(result);
        Assert.Empty(result.Suggestions);
    }

    [Fact]
    public async Task SuggestOptimizationSkill_ReturnsSuggestions_WhenApiKeyIsConfigured()
    {
        var httpClient = new HttpClient();
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"LLM:OpenAI:ApiKey", "sk-test-key"}
        };
        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var skill = new SuggestOptimizationSkill(httpClient, config, _mockSuggestLogger.Object);

        var result = await skill.ExecuteAsync("Check out my coding setup");

        Assert.NotNull(result);
        Assert.NotEmpty(result.Suggestions);
    }
}
