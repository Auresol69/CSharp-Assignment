using Neo4j.Driver;
using Microsoft.Extensions.Configuration;
using InteractHub_Shared.DTOs.Posts;

public interface IAdvancedGraphService
{
    Task<List<RecommendedPostDto>> GetPersonalizedRecommendationsAsync(int userId, int page, int pageSize);

    /// <summary>
    /// Tạo hoặc cập nhật node User trong Neo4j (idempotent qua MERGE).
    /// </summary>
    Task SyncUserNodeAsync(string userId);

    /// <summary>
    /// Tạo hoặc cập nhật node Post + relationship [:POSTED] từ User → Post (idempotent).
    /// </summary>
    Task SyncPostNodeAsync(string postId, string userId);

    /// <summary>
    /// Tạo các node Hashtag và relationship [:TAGGED] từ Post → Hashtag (idempotent).
    /// Nhận danh sách tên hashtag đã được chuẩn hóa (lowercase, không dấu #).
    /// </summary>
    Task SyncHashtagsForPostAsync(string postId, IEnumerable<string> hashtags);

    /// <summary>
    /// Tạo relationship [:LIKED] từ User → Post (idempotent).
    /// Được gọi sau khi user Like một bài viết thành công.
    /// </summary>
    Task SyncLikeRelationshipAsync(string userId, string postId);
}

public class AdvancedGraphService : IAdvancedGraphService
{
    private readonly IDriver _driver;

    public AdvancedGraphService(IConfiguration config)
    {
        // Khởi tạo Driver - Nên đăng ký Driver dưới dạng Singleton trong Dependency Injection
        // Uri và User từ appsettings.json, Password từ environment variable (docker-compose)
        string uri = config["Neo4j:Uri"];
        string user = config["Neo4j:User"];
        string password = Environment.GetEnvironmentVariable("Neo4j__Password") ?? "InteractHub123";
        
        _driver = GraphDatabase.Driver(
            uri, 
            AuthTokens.Basic(user, password)
        );
    }

    public async Task<List<RecommendedPostDto>> GetPersonalizedRecommendationsAsync(int userId, int page, int pageSize)
    {
        int skip = (page - 1) * pageSize;
        int limit = pageSize;

        // Duyệt đồ thị qua 3 bước (User -> Post -> Hashtag -> RecommendedPost)
        string cypherQuery = @"
            MATCH (u:User {id: $userId})-[:LIKED]->(myLikedPost:Post)-[:TAGGED]->(h:Hashtag)
            MATCH (h)<-[:TAGGED]-(recommendedPost:Post)
            
            // Điều kiện loại trừ: Không lấy bài viết của chính mình, bài đã LIKE
            WHERE NOT (u)-[:POSTED]->(recommendedPost) 
              AND NOT (u)-[:LIKED]->(recommendedPost)
              AND recommendedPost.id <> myLikedPost.id
            
            // Gom nhóm tính toán Score và gom các tên Hashtag chung vào một mảng
            WITH recommendedPost, 
                 COUNT(DISTINCT h) AS commonTagsCount, 
                 COLLECT(DISTINCT h.name) AS sharedTags
            
            // Công thức tính điểm ưu tiên (Ví dụ đơn giản: dựa trên số lượng tag trùng)
            RETURN recommendedPost.id AS PostId, 
                   commonTagsCount AS SharedTagsCount, 
                   sharedTags AS SharedTags,
                   ToFloat(commonTagsCount) * 1.5 AS RecommendationScore
            ORDER BY RecommendationScore DESC, PostId DESC
            SKIP $skip LIMIT $limit";

        var parameters = new Dictionary<string, object>
        {
            { "userId", userId },
            { "skip", skip },
            { "limit", limit }
        };

        var recommendedPosts = new List<RecommendedPostDto>();

        // Sử dụng AsyncSession với cấu hình tối ưu hiệu năng đọc (Read Session)
        await using var session = _driver.AsyncSession(o => o.WithDatabase("neo4j"));

        try
        {
            // ExecuteReadAsync tự động quản lý retry logic nếu kết nối mạng chập chờn
            await session.ExecuteReadAsync(async tx =>
            {
                var resultCursor = await tx.RunAsync(cypherQuery, parameters);

                // Mapping dữ liệu thô (IRecord) sang C# Object đầy thách thức
                while (await resultCursor.FetchAsync())
                {
                    var record = resultCursor.Current;

                    // Bóc tách an toàn các kiểu dữ liệu của Neo4j (string GUID, Long → Int)
                    string postId = record["PostId"].As<string>();
                    int sharedTagsCount = record["SharedTagsCount"].As<int>();
                    double score = record["RecommendationScore"].As<double>();
                    
                    // Neo4j trả về List<object>, cần cast mượt mà sang List<string>
                    var sharedTagsList = record["SharedTags"].As<List<object>>()
                                            .Select(x => x.ToString())
                                            .Where(x => x != null)
                                            .ToList()!;

                    recommendedPosts.Add(new RecommendedPostDto(postId, sharedTagsCount, sharedTagsList, score));
                }
            });
        }
        catch (Exception ex)
        {
            // Log error ở đây tùy theo hệ thống của bạn (Serilog/ILogger)
            throw new Exception("Lỗi khi truy vấn đồ thị gợi ý bài viết", ex);
        }

        return recommendedPosts;
    }

    // ──────────────────────────────────────────────────────────────
    // Graph Sync Methods — Khởi tạo node/relationship từ SQL → Neo4j
    // ──────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task SyncUserNodeAsync(string userId)
    {
        // MERGE đảm bảo idempotent: không tạo trùng node nếu đã tồn tại
        const string cypher = """
            MERGE (u:User {id: $userId})
            """;

        await using var session = _driver.AsyncSession(o => o.WithDatabase("neo4j"));
        try
        {
            await session.ExecuteWriteAsync(async tx =>
            {
                var cursor = await tx.RunAsync(cypher, new { userId });
                await cursor.ConsumeAsync();
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi sync node User '{userId}' vào Neo4j", ex);
        }
    }

    /// <inheritdoc />
    public async Task SyncPostNodeAsync(string postId, string userId)
    {
        // MERGE node Post, MERGE node User (đảm bảo tồn tại), rồi MERGE relationship [:POSTED]
        const string cypher = """
            MERGE (p:Post {id: $postId})
            MERGE (u:User {id: $userId})
            MERGE (u)-[:POSTED]->(p)
            """;

        await using var session = _driver.AsyncSession(o => o.WithDatabase("neo4j"));
        try
        {
            await session.ExecuteWriteAsync(async tx =>
            {
                var cursor = await tx.RunAsync(cypher, new { postId, userId });
                await cursor.ConsumeAsync();
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi sync node Post '{postId}' vào Neo4j", ex);
        }
    }

    /// <inheritdoc />
    public async Task SyncHashtagsForPostAsync(string postId, IEnumerable<string> hashtags)
    {
        var hashtagList = hashtags?.ToList();
        if (hashtagList == null || hashtagList.Count == 0)
        {
            return;
        }

        // Dùng UNWIND để xử lý một batch nhiều hashtag trong một lần round-trip
        const string cypher = """
            MATCH (p:Post {id: $postId})
            UNWIND $hashtags AS tagName
            MERGE (h:Hashtag {name: tagName})
            MERGE (p)-[:TAGGED]->(h)
            """;

        await using var session = _driver.AsyncSession(o => o.WithDatabase("neo4j"));
        try
        {
            await session.ExecuteWriteAsync(async tx =>
            {
                var cursor = await tx.RunAsync(cypher, new { postId, hashtags = hashtagList });
                await cursor.ConsumeAsync();
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi sync hashtags cho Post '{postId}' vào Neo4j", ex);
        }
    }

    /// <inheritdoc />
    public async Task SyncLikeRelationshipAsync(string userId, string postId)
    {
        // MERGE node User và Post (đảm bảo tồn tại), rồi MERGE relationship [:LIKED]
        const string cypher = """
            MERGE (u:User {id: $userId})
            MERGE (p:Post {id: $postId})
            MERGE (u)-[:LIKED]->(p)
            """;

        await using var session = _driver.AsyncSession(o => o.WithDatabase("neo4j"));
        try
        {
            await session.ExecuteWriteAsync(async tx =>
            {
                var cursor = await tx.RunAsync(cypher, new { userId, postId });
                await cursor.ConsumeAsync();
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi sync relationship LIKED ({userId} → {postId}) vào Neo4j", ex);
        }
    }
}