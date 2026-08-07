using InteractHub_API.Agents.Services;
using YamlDotNet.Serialization;
using InteractHub_API.Agents.Models;

namespace InteractHub_API.Agents.Extensions;

/// <summary>
/// Extension methods for registering skills in the DI container.
/// </summary>
public static class SkillRegistrationExtensions
{
    /// <summary>
    /// Register all core skills and load YAML manifests.
    /// </summary>
    public static IServiceCollection AddSkillServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ── Existing skills ──────────────────────────────────────
        services.AddScoped<IAnalyzePostPerformanceSkill, AnalyzePostPerformanceSkill>();
        services.AddScoped<ISuggestOptimizationSkill, SuggestOptimizationSkill>();
        services.AddScoped<IGetTrendingTopicsSkill, GetTrendingTopicsSkill>();

        // Register HttpClient for LLM calls (SuggestOptimization)
        services.AddHttpClient<ISuggestOptimizationSkill, SuggestOptimizationSkill>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // Register LLM client (OpenAI-compatible)
        services.AddHttpClient<ILlmClient, OpenAiLlmClient>();

        // Register Agent Orchestrator
        services.AddScoped<IAgentOrchestrator, AgentOrchestratorService>();

        // Register skill registry loader
        services.AddSingleton<ISkillRegistryLoader, SkillRegistryLoader>();

        // ── Feature 1: Chat Memory ───────────────────────────────
        // Singleton: stateless service; all state lives in Redis.
        services.AddSingleton<IChatMemoryService, ChatMemoryService>();

        // ── Feature 2: Prompt Cache + Embedding ─────────────────
        // EmbeddingService gets its own named HttpClient.
        services.AddHttpClient<IEmbeddingService, OpenAiEmbeddingService>();
        services.AddSingleton<IPromptCacheService, PromptCacheService>();

        // ── Feature 3: Vector DB (RAG) ───────────────────────────
        services.AddSingleton<IVectorDbService, VectorDbService>();

        // Ensure HNSW index is created at application startup.
        services.AddHostedService<VectorDbStartupService>();

        return services;
    }
}

/// <summary>
/// Interface for loading and caching skill definitions from YAML.
/// </summary>
public interface ISkillRegistryLoader
{
    Task<SkillDefinition> LoadSkillAsync(string skillName);
    Task<List<SkillDefinition>> LoadAllSkillsAsync();
}

/// <summary>
/// Loads YAML skill definitions from the Agents/Skills directory.
/// </summary>
public class SkillRegistryLoader : ISkillRegistryLoader
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<SkillRegistryLoader> _logger;
    private readonly Dictionary<string, SkillDefinition> _cache = new();

    public SkillRegistryLoader(IWebHostEnvironment environment, ILogger<SkillRegistryLoader> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<SkillDefinition> LoadSkillAsync(string skillName)
    {
        if (_cache.TryGetValue(skillName, out var cached))
        {
            return cached;
        }

        var skillPath = Path.Combine(_environment.ContentRootPath, "Agents", "Skills", $"{skillName}.yaml");

        if (!File.Exists(skillPath))
        {
            throw new FileNotFoundException($"Skill definition not found: {skillPath}");
        }

        var yaml = await File.ReadAllTextAsync(skillPath);
        var deserializer = new DeserializerBuilder().Build();
        var definition = deserializer.Deserialize<SkillDefinition>(yaml);

        if (definition != null)
        {
            _cache[skillName] = definition;
            _logger.LogInformation("Loaded skill: {SkillName}", skillName);
        }

        return definition ?? throw new InvalidOperationException($"Failed to deserialize skill: {skillName}");
    }

    public async Task<List<SkillDefinition>> LoadAllSkillsAsync()
    {
        var skillsDir = Path.Combine(_environment.ContentRootPath, "Agents", "Skills");
        if (!Directory.Exists(skillsDir))
        {
            _logger.LogWarning("Skills directory not found: {SkillsDir}", skillsDir);
            return new();
        }

        var definitions = new List<SkillDefinition>();
        var yamlFiles = Directory.GetFiles(skillsDir, "*.yaml");

        foreach (var file in yamlFiles)
        {
            try
            {
                var skillName = Path.GetFileNameWithoutExtension(file);
                var definition = await LoadSkillAsync(skillName);
                definitions.Add(definition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading skill from {FilePath}", file);
            }
        }

        _logger.LogInformation("Loaded {Count} skills from registry.", definitions.Count);
        return definitions;
    }
}

// ═══════════════════════════════════════════════════════════════════
// VectorDbStartupService
// Ensures the HNSW RediSearch index exists once at application startup.
// Runs as a hosted background service so the main request pipeline is
// never blocked.
// ═══════════════════════════════════════════════════════════════════

public class VectorDbStartupService : BackgroundService
{
    private readonly IVectorDbService _vectorDb;
    private readonly ILogger<VectorDbStartupService> _logger;

    public VectorDbStartupService(
        IVectorDbService vectorDb,
        ILogger<VectorDbStartupService> logger)
    {
        _vectorDb = vectorDb;
        _logger   = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            _logger.LogInformation("VectorDbStartupService: ensuring HNSW index…");
            await _vectorDb.EnsureIndexAsync(stoppingToken);
            _logger.LogInformation("VectorDbStartupService: index ready.");
        }
        catch (Exception ex)
        {
            // Log but do not crash the application – RediSearch may not be available
            // in all environments (e.g., plain Redis without the Search module).
            _logger.LogWarning(ex,
                "VectorDbStartupService: could not create index. " +
                "Vector search will be unavailable until RediSearch is enabled.");
        }
    }
}
