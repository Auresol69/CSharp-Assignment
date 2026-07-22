# Agents/Skills Implementation Guide

This document explains the complete skills registry implementation for InteractHub API.

## Overview

The **Agents/Skills** system provides a lightweight registry and service infrastructure for extensible agent-like features. The MVP includes three core skills:

1. **AnalyzePostPerformance** — Aggregates metrics (likes, comments, reposts, impressions) from Redis and SQL.
2. **SuggestOptimization** — Uses an LLM to analyze post content and provide optimization suggestions.
3. **GetTrendingTopics** — Queries Redis sorted sets for trending topics by category.

## Architecture

### Layers

```
┌─────────────────────────────────────────────┐
│  HTTP Endpoints (SkillsController)          │
│  GET/POST /api/skills/...                  │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│  Skill Service Interfaces (IXxxSkill)       │
│  Defines inputs, outputs, execution         │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│  Skill Implementations (XxxSkill)           │
│  Redis/SQL/LLM-specific logic               │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│  Infrastructure (Redis, DB, HTTP)           │
│  Shared connections (IConnectionMultiplexer)│
└─────────────────────────────────────────────┘
```

### File Structure

```
InteractHub_API/
├── Agents/
│   ├── Controllers/
│   │   └── SkillsController.cs           # HTTP endpoints
│   ├── DTOs/
│   │   └── SkillDtos.cs                  # Request/response models
│   ├── Extensions/
│   │   └── SkillRegistrationExtensions.cs # DI + Registry loader
│   ├── Models/
│   │   └── SkillDefinition.cs            # YAML deserialization models
│   ├── Services/
│   │   ├── ISkillServices.cs             # Interfaces
│   │   ├── AnalyzePostPerformanceSkill.cs
│   │   ├── SuggestOptimizationSkill.cs
│   │   └── GetTrendingTopicsSkill.cs
│   └── Skills/
│       ├── AnalyzePostPerformance.yaml
│       ├── SuggestOptimization.yaml
│       ├── GetTrendingTopics.yaml
│       └── README.md
```

## Service Descriptions

### 1. AnalyzePostPerformance

**Purpose:** Query and aggregate post interaction metrics.

**Implementation:**
- **Primary source:** Redis (keys: `post:{id}:likes`, `post:{id}:comments`, etc.)
- **Fallback:** SQL (if Redis keys are empty)
- **Output:** Normalized KPIs including engagement rate

**Endpoint:**
```http
GET /api/skills/analyze-performance/{postId}
```

**Response:**
```json
{
  "metrics": {
    "likes": 120,
    "comments": 18,
    "reposts": 5,
    "impressions": 4500,
    "engagementRate": 0.031,
    "ctr": 0.012
  },
  "rawSources": {
    "likes": { "value": 120, "source": "redis" },
    "impressions": { "value": 4500, "source": "sql" }
  }
}
```

**Usage in code:**
```csharp
var result = await _analyzeSkill.ExecuteAsync("post-id-123");
Console.WriteLine($"Engagement: {result.Metrics.EngagementRate}");
```

### 2. SuggestOptimization

**Purpose:** Generate LLM-powered suggestions for post improvement.

**Implementation:**
- Sanitizes post content
- Builds a few-shot prompt with examples
- Calls LLM API (OpenAI, Anthropic, etc.)
- Returns parsed suggestions with confidence scores

**Configuration (appsettings.json):**
```json
{
  "LLM": {
    "OpenAI": {
      "ApiKey": "${LLM_API_KEY}"
    }
  }
}
```

**Endpoint:**
```http
POST /api/skills/suggest-optimization
Content-Type: application/json

{
  "postContent": "Check out my new coding setup #devlife",
  "mediaUrls": ["https://example.com/image.jpg"],
  "language": "en"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "type": "caption",
      "text": "New coding setup — boosted productivity and comfort!",
      "confidence": 0.87
    },
    {
      "type": "hashtag",
      "text": "#coding #devsetup #productivity",
      "confidence": 0.78
    }
  ],
  "llmPrompt": "<redacted>"
}
```

**Usage in code:**
```csharp
var result = await _suggestSkill.ExecuteAsync(
    "My new laptop setup",
    mediaUrls: new List<string> { "url1", "url2" },
    language: "vi"
);
```

### 3. GetTrendingTopics

**Purpose:** Retrieve top trending topics for a category.

**Implementation:**
- Queries Redis sorted set `trending:{category}`
- Returns top-N items with scores in descending order

**Endpoint:**
```http
GET /api/skills/trending-topics?category=tech&limit=5
```

**Response:**
```json
{
  "topics": [
    { "topic": "#AI", "score": 982.3 },
    { "topic": "#DotNet", "score": 712.1 },
    { "topic": "#WebDev", "score": 634.5 }
  ]
}
```

**Usage in code:**
```csharp
var result = await _trendingSkill.ExecuteAsync(category: "tech", limit: 10);
```

## Dependency Injection Setup

The following code in `Program.cs` registers all skills:

```csharp
using InteractHub_API.Agents.Extensions;

// ...

builder.Services.AddSkillServices(builder.Configuration);
```

This automatically:
- Registers skill service implementations
- Registers the HTTP client for LLM calls
- Registers the `ISkillRegistryLoader` for loading YAML manifests

## Using the Skill Registry Loader

Load YAML skill definitions at runtime:

```csharp
public class MyService
{
    private readonly ISkillRegistryLoader _registry;

    public MyService(ISkillRegistryLoader registry)
    {
        _registry = registry;
    }

    public async Task LoadSkills()
    {
        // Load a single skill
        var analyzeSkill = await _registry.LoadSkillAsync("AnalyzePostPerformance");
        Console.WriteLine($"Skill: {analyzeSkill.Name}");

        // Load all skills
        var allSkills = await _registry.LoadAllSkillsAsync();
        foreach (var skill in allSkills)
        {
            Console.WriteLine($"- {skill.Name} (v{skill.Version})");
        }
    }
}
```

## Adding a New Skill

To add a new skill (e.g., `SuggestContentType`):

1. **Create YAML definition** in `Agents/Skills/SuggestContentType.yaml`:
   ```yaml
   id: suggest_content_type
   name: SuggestContentType
   version: 1.0
   description: |
     Analyze content and suggest optimal content type (video, carousel, reel, etc.)
   inputs:
     - name: content
       type: string
       required: true
   # ...
   ```

2. **Create DTOs** in `Agents/DTOs/SkillDtos.cs`:
   ```csharp
   public class SuggestContentTypeResponseDto
   {
       public string ContentType { get; set; }
       public double Confidence { get; set; }
   }
   ```

3. **Create interface** in `Agents/Services/ISkillServices.cs`:
   ```csharp
   public interface ISuggestContentTypeSkill
   {
       Task<SuggestContentTypeResponseDto> ExecuteAsync(string content);
   }
   ```

4. **Implement service** in `Agents/Services/SuggestContentTypeSkill.cs`:
   ```csharp
   public class SuggestContentTypeSkill : ISuggestContentTypeSkill
   {
       // Implementation
   }
   ```

5. **Register in DI** in `Agents/Extensions/SkillRegistrationExtensions.cs`:
   ```csharp
   services.AddScoped<ISuggestContentTypeSkill, SuggestContentTypeSkill>();
   ```

6. **Add endpoint** in `Controllers/SkillsController.cs`:
   ```csharp
   [HttpPost("suggest-content-type")]
   public async Task<IActionResult> SuggestContentType([FromBody] string content)
   {
       var result = await _suggestContentTypeSkill.ExecuteAsync(content);
       return Ok(result);
   }
   ```

## Configuration

### Redis Setup

Ensure Redis is configured with sorted sets for trending topics:

```csharp
// Populate trending topics in Redis (example)
var db = _redis.GetDatabase();
await db.SortedSetAddAsync("trending:tech", new[] {
    new SortedSetEntry("#AI", 982.3),
    new SortedSetEntry("#DotNet", 712.1)
});
```

### LLM Configuration

Set the LLM API key in `appsettings.json` or environment variables:

```json
{
  "LLM": {
    "OpenAI": {
      "ApiKey": "sk-..."
    }
  }
}
```

Or via environment variable:
```bash
export LLM_OPENAI_APIKEY="sk-..."
```

## Error Handling

All skill endpoints follow this pattern:

- **400 Bad Request:** Invalid input parameters
- **404 Not Found:** Resource not found (post, etc.)
- **500 Internal Server Error:** Unhandled exceptions

Example:
```csharp
[HttpGet("analyze-performance/{postId}")]
public async Task<IActionResult> AnalyzePostPerformance(string postId)
{
    try
    {
        var result = await _analyzeSkill.ExecuteAsync(postId);
        return Ok(result);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new { error = ex.Message });
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error");
        return StatusCode(500, new { error = "An error occurred." });
    }
}
```

## Testing

### Unit Tests Example

```csharp
[TestClass]
public class AnalyzePostPerformanceSkillTests
{
    private Mock<AppDbContext> _dbContext;
    private Mock<IConnectionMultiplexer> _redis;
    private AnalyzePostPerformanceSkill _skill;

    [TestInitialize]
    public void Setup()
    {
        _dbContext = new Mock<AppDbContext>();
        _redis = new Mock<IConnectionMultiplexer>();
        _skill = new AnalyzePostPerformanceSkill(_dbContext.Object, _redis.Object, Mock.Of<ILogger<AnalyzePostPerformanceSkill>>());
    }

    [TestMethod]
    public async Task ExecuteAsync_WithValidPostId_ReturnsMetrics()
    {
        // Arrange
        var postId = "test-post-123";

        // Act
        var result = await _skill.ExecuteAsync(postId);

        // Assert
        Assert.IsNotNull(result.Metrics);
    }
}
```

## Monitoring & Logging

All skills log key events:

```csharp
_logger.LogInformation("Loaded skill: {SkillName}", skillName);
_logger.LogWarning("Redis keys missing for post {PostId}. Falling back to SQL.", postId);
_logger.LogError(ex, "Error analyzing post performance for {PostId}", postId);
```

Monitor logs to track skill usage and performance.

## Performance Considerations

1. **Caching:** Consider caching results in Redis for frequently analyzed posts.
2. **Rate Limiting:** Implement rate limits on LLM calls to avoid excessive costs.
3. **Async/Await:** All operations use async patterns to prevent thread pool starvation.
4. **Lazy Loading:** YAML skills are loaded on-demand and cached by registry loader.

## Future Enhancements

1. **Skill Versioning:** Support multiple versions of the same skill.
2. **Feature Flags:** Enable/disable skills per environment.
3. **Metrics Aggregation:** Track skill usage and performance KPIs.
4. **Dynamic Loading:** Load skills from a database or external registry.
5. **Skill Composition:** Chain multiple skills together for complex workflows.
