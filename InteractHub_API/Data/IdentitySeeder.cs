using InteractHub_API.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace InteractHub_API.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var seedEnabled = configuration.GetValue("SeedData:Enabled", false);
        if (!seedEnabled)
        {
            logger.LogInformation("Identity seed skipped because SeedData:Enabled is false or missing.");
            return;
        }

        var roles = new[] { "Admin", "Moderator", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(role));
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Cannot create role '{role}': {string.Join("; ", result.Errors.Select(e => e.Description))}");
                }
            }
        }

        await EnsureUserWithRoleAsync(
            userManager,
            roleName: "Admin",
            email: GetRequiredSeedValue(configuration, "SeedUsers:Admin:Email"),
            password: GetRequiredSeedValue(configuration, "SeedUsers:Admin:Password"),
            displayName: GetRequiredSeedValue(configuration, "SeedUsers:Admin:TenTaiKhoan"));

        await EnsureUserWithRoleAsync(
            userManager,
            roleName: "Moderator",
            email: GetRequiredSeedValue(configuration, "SeedUsers:Moderator:Email"),
            password: GetRequiredSeedValue(configuration, "SeedUsers:Moderator:Password"),
            displayName: GetRequiredSeedValue(configuration, "SeedUsers:Moderator:TenTaiKhoan"));

        logger.LogInformation("Identity seed complete. Admin and Moderator accounts are ready.");
    }

    private static string GetRequiredSeedValue(IConfiguration configuration, string key)
    {
        return configuration[key]
            ?? throw new InvalidOperationException($"Missing required seed configuration value: {key}");
    }

    private static async Task EnsureUserWithRoleAsync(
        UserManager<ApplicationUser> userManager,
        string roleName,
        string email,
        string password,
        string displayName)
    {
        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = email,
                Email = email,
                TenTaiKhoan = displayName,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Cannot create seeded user '{email}': {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
            }
        }

        if (!await userManager.IsInRoleAsync(user, roleName))
        {
            var addRoleResult = await userManager.AddToRoleAsync(user, roleName);
            if (!addRoleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Cannot assign role '{roleName}' to '{email}': {string.Join("; ", addRoleResult.Errors.Select(e => e.Description))}");
            }
        }
    }
}
