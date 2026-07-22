# Agents/Skills Registry

This folder contains lightweight skill definitions (YAML) used as a registry for agent-like features.

Purpose:
- Provide a simple, discoverable manifest for each skill (inputs, outputs, implementation notes).
- Allow runtime code to load skill definitions for wiring to implementations (Redis/SQL/LLM).

Files added:
- `AnalyzePostPerformance.yaml` — metrics aggregation (Redis + SQL fallback).
- `SuggestOptimization.yaml` — LLM-powered caption/image suggestions.
- `GetTrendingTopics.yaml` — Redis sorted set reader for trending topics.

Usage (example, C#):

1. Load YAML using `YamlDotNet`.

```csharp
using YamlDotNet.Serialization;
using System.IO;

var yaml = File.ReadAllText("Agents/Skills/AnalyzePostPerformance.yaml");
var deserializer = new DeserializerBuilder().Build();
var doc = deserializer.Deserialize<object>(yaml);
// Map to a typed model if desired and wire to service implementation
```

2. Implementation: create services that implement the declared behavior and register them in DI.

Notes:
- These YAML files are registry metadata only — you still need to implement the actual service logic
  (Redis queries, SQL queries, or LLM calls) and wire them to the skill IDs above.
- Keep the YAML simple; update `implementation_notes` when the runtime expectations change.
