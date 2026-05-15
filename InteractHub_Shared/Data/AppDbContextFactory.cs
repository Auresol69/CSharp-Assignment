using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InteractHub_Shared.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        
        // Load .env file
        LoadDotEnv();
        
        // Read connection string from environment variable
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? throw new InvalidOperationException(
                "ConnectionStrings__DefaultConnection environment variable is not set. " +
                "Please configure it in .env file or as an environment variable."
            );
        
        optionsBuilder.UseSqlServer(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
    
    private static void LoadDotEnv()
    {
        var envPath = Path.Combine(FindProjectRoot(), ".env");
        if (!File.Exists(envPath))
        {
            return;
        }

        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith('#'))
            {
                continue;
            }

            var separatorIndex = trimmedLine.IndexOf('=');
            if (separatorIndex <= 0)
            {
                continue;
            }

            var key = trimmedLine[..separatorIndex].Trim();
            var value = trimmedLine[(separatorIndex + 1)..].Trim().Trim('"');
            Environment.SetEnvironmentVariable(key, value);
        }
    }
    
    private static string FindProjectRoot()
    {
        var currentDirectory = AppContext.BaseDirectory;
        while (!File.Exists(Path.Combine(currentDirectory, ".env")))
        {
            var parentDirectory = Path.GetDirectoryName(currentDirectory);
            if (parentDirectory == null || parentDirectory == currentDirectory)
            {
                break;
            }
            currentDirectory = parentDirectory;
        }
        return currentDirectory;
    }
}