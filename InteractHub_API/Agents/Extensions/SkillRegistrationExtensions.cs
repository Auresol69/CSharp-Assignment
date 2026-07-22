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
        // Register skill implementations
        services.AddScoped<IAnalyzePostPerformanceSkill, AnalyzePostPerformanceSkill>();
        services.AddScoped<ISuggestOptimizationSkill, SuggestOptimizationSkill>();
        services.AddScoped<IGetTrendingTopicsSkill, GetTrendingTopicsSkill>();

        // Register HttpClient for LLM calls
        services.AddHttpClient<ISuggestOptimizationSkill, SuggestOptimizationSkill>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // Register skill registry loader
        services.AddSingleton<ISkillRegistryLoader, SkillRegistryLoader>();

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
