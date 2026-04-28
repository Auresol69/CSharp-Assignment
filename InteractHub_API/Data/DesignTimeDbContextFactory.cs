using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InteractHub_API.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            // Thay đổi chuỗi connection string cho đúng với Docker SQL Server
            optionsBuilder.UseSqlServer("Server=localhost,1433;Database=Interact_Hub;User Id=sa;Password=InteractHub@2026;TrustServerCertificate=True");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}