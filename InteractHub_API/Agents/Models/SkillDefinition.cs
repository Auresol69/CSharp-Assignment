namespace InteractHub_API.Agents.Models;

/// <summary>
/// Generic skill definition model used to deserialize YAML skill manifests.
/// </summary>
public class SkillDefinition
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Version { get; set; }
    public string Description { get; set; }
    public List<SkillInput> Inputs { get; set; } = new();
    public Dictionary<string, object> Outputs { get; set; } = new();
    public string ImplementationNotes { get; set; }
    public List<SkillExample> Examples { get; set; } = new();
}

public class SkillInput
{
    public string Name { get; set; }
    public string Type { get; set; }
    public bool Required { get; set; }
    public string Description { get; set; }
}

public class SkillExample
{
    public Dictionary<string, object> Request { get; set; }
    public Dictionary<string, object> Response { get; set; }
}
