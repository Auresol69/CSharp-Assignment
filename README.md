# InteractHub

A social media web application built with ASP.NET Core 10, React + TypeScript, and a multi-database architecture (SQL Server, Redis, Neo4j).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Local Development](#local-development)
- [Testing](#testing)
- [Benchmark Results](#benchmark-results)

---

## Overview

InteractHub is a full-stack social media platform. The backend exposes a RESTful API secured with JWT Bearer authentication. Real-time features (notifications, presence, messaging) are delivered over SignalR backed by Redis Pub/Sub. A separate background worker service consumes a Redis Stream to process and persist notifications asynchronously.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Backend API | ASP.NET Core 10 (`net10.0`) |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| ORM | Entity Framework Core 10 + SQL Server 2022 |
| Identity | ASP.NET Core Identity |
| Cache | Redis (StackExchange.Redis) |
| Graph DB | Neo4j 6 (Neo4j.Driver) |
| Real-time | SignalR (Redis backplane) |
| Media Storage | Cloudinary |
| Auth | JWT Bearer |
| Reverse Proxy | Nginx (least_conn load balancing) |
| Container | Docker + Docker Compose |
| E2E Testing | Playwright |

---

## Architecture

```
                         ┌──────────┐
                         │  Nginx   │  :80 / :5153
                         │ least_conn│
                         └────┬─────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌─────▼─────┐  ┌─────▼─────┐
        │  API :8080│   │  API :8080│  │  API :8080│  (scalable replicas)
        └─────┬─────┘   └─────┬─────┘  └─────┬─────┘
              │               │               │
    ┌─────────▼───────────────▼───────────────▼─────────┐
    │                  Shared Infrastructure              │
    │  SQL Server 2022  |  Redis Alpine  |  Neo4j Latest │
    └─────────────────────────────────────────────────────┘
              │
        ┌─────▼──────┐
        │   Worker   │  (Redis Stream consumer)
        └────────────┘
```

**Request flow:**
1. Client sends HTTP/WebSocket requests to Nginx on port 80.
2. Nginx routes to one of N API replicas using `least_conn`.
3. API validates JWT, executes business logic, reads/writes SQL Server, Redis, and Neo4j.
4. Notification events are published to a Redis Stream (`interacthub:notifications:stream`).
5. `InteractHub_Worker` consumes the stream, persists notifications to SQL, and pushes them over SignalR.

---

## Project Structure

```
CSharp-Assignment/
├── InteractHub_API/              # ASP.NET Core 10 Web API
│   ├── Agents/                   # Skills registry + LLM-powered endpoints
│   │   ├── Controllers/          # SkillsController
│   │   ├── DTOs/
│   │   ├── Extensions/           # DI registration (AddSkillServices)
│   │   ├── Models/               # YAML deserialization models
│   │   ├── Services/             # AnalyzePostPerformance, SuggestOptimization, GetTrendingTopics
│   │   └── Skills/               # YAML skill definitions
│   ├── Controllers/              # 15 REST controllers
│   ├── Data/
│   │   ├── Constants/
│   │   └── Repositories/         # IPostRepository, PostRepository
│   ├── Extensions/
│   ├── Helpers/                  # CloudinaryUrlHelper
│   ├── Middlewares/              # RateLimitingMiddleware (sliding window)
│   ├── Services/                 # Business logic layer
│   │   ├── Friends/              # FriendService
│   │   ├── AuthService.cs
│   │   ├── ChatService.cs
│   │   ├── CloudinaryService.cs
│   │   ├── CommentService.cs
│   │   ├── FriendshipService.cs
│   │   ├── HashtagService.cs
│   │   ├── InteractionService.cs
│   │   ├── PostService.cs
│   │   ├── ProfileService.cs
│   │   ├── ReportService.cs
│   │   ├── StoryCleanupService.cs  # BackgroundService (hourly)
│   │   ├── StoryService.cs
│   │   ├── AdvancedGraphService.cs # Neo4j graph queries
│   │   └── I*.cs                   # Interfaces
│   ├── Program.cs
│   ├── appsettings.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── InteractHub_Shared/           # Class library shared by API and Worker
│   ├── Data/
│   │   ├── AppDbContext.cs       # EF Core context (26 KB, all entity configs)
│   │   ├── AppDbContextFactory.cs
│   │   ├── IdentitySeeder.cs
│   │   └── Entities/             # 14 domain entities
│   │       ├── ApplicationUser.cs
│   │       ├── Post.cs
│   │       ├── Comment.cs
│   │       ├── Like.cs
│   │       ├── Story.cs
│   │       ├── Friendship.cs
│   │       ├── Notification.cs
│   │       ├── Conversation.cs
│   │       ├── Message.cs
│   │       ├── Hashtag.cs
│   │       ├── PostHashtag.cs
│   │       ├── PostMedia.cs
│   │       ├── PostReport.cs
│   │       └── MediaType.cs
│   ├── DTOs/                     # Shared request/response DTOs (10 subfolders)
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── Friends/
│   │   ├── Interactions/
│   │   ├── Media/
│   │   ├── Moderation/
│   │   ├── Notifications/
│   │   ├── Posts/
│   │   ├── Profiles/
│   │   └── Stories/
│   ├── Hubs/
│   │   ├── NotificationHub.cs
│   │   └── INotificationClient.cs
│   ├── Migrations/               # EF Core migrations
│   └── Services/
│       ├── NotificationService.cs
│       ├── PresenceService.cs
│       ├── IChatService.cs
│       └── IPresenceService.cs
│
├── InteractHub_Worker/           # Background worker (.NET Worker Service)
│   ├── Worker.cs                 # RedisStreamWorker (BackgroundService)
│   └── Program.cs
│
├── InteractHub_API.UnitTests/    # MSTest unit tests
│   ├── CacheExtensionsTests.cs
│   ├── CloudinaryUrlHelperTests.cs
│   ├── RateLimitingMiddlewareTests.cs
│   └── SkillServicesTests.cs
│
├── InteractHub_API.IntegrationTests/
│   └── ApiIntegrationTests.cs
│
├── ClientApp/                    # React + TypeScript + Vite frontend
│   ├── src/
│   ├── tests/                    # Playwright E2E tests
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── playwright.config.ts
│
├── nginx.conf                    # Nginx reverse proxy + load balancer config
├── benchmark.js                  # Node.js load testing script
├── BENCHMARK_REPORT.md
└── CSharp-Assignment.sln
```

---

## Features

| Feature | Description |
| :--- | :--- |
| Authentication | Register, login, JWT Bearer token (24h expiry), account lockout after 5 failed attempts |
| Posts | Create, read, paginated cursor-based feed (`lastTimestamp` + `limit`) |
| Interactions | Like, comment, share on posts |
| Stories | Time-limited stories (auto-deleted after 24h by `StoryCleanupService`) |
| Friendship | Send, accept friend requests; follow/unfollow users |
| Chat | Real-time direct messaging over SignalR |
| Notifications | Async notification pipeline via Redis Stream + Worker |
| Presence | Online/offline user tracking via Redis |
| Profile | View/update profile, upload avatar (Cloudinary), change password |
| Moderation | Report posts, admin moderation panel, trending hashtags |
| Skills/Agents | LLM-powered post optimization, performance analytics, trending topics |
| Graph | Neo4j-powered advanced social graph queries (`AdvancedGraphService`) |

---

## API Reference

All endpoints require `Authorization: Bearer <token>` unless stated otherwise.

### Auth

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Auth/register` | No | Register a new account |
| `POST` | `/api/Auth/login` | No | Login, returns JWT token |

### Profile

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Profile/me` | Get current user profile |
| `GET` | `/api/Profile/{userId}` | Get another user's profile |
| `PUT` | `/api/Profile/me` | Update current user profile |
| `POST` | `/api/Profile/change-password` | Change password |
| `POST` | `/api/Profile/upload-avatar` | Upload avatar (`multipart/form-data`) |
| `POST` | `/api/Profile/{userId}/follow` | Follow or unfollow a user |
| `GET` | `/api/Profile/{userId}/followers?page=1&size=20` | Get follower list |
| `GET` | `/api/Profile/{userId}/following?page=1&size=20` | Get following list |

### Posts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Post/feed?lastTimestamp={isoDateTime}&limit=10` | Cursor-based paginated feed |

### Friends

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/Friendship/{recipientId}/request` | Send friend request |
| `POST` | `/api/Friendship/{senderId}/accept` | Accept friend request |

### Comments

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Comments/{postId}` | Get comments for a post |
| `POST` | `/api/Comments/{postId}` | Add a comment |
| `DELETE` | `/api/Comments/{commentId}` | Delete a comment |

### Stories

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Story` | Get active stories |
| `POST` | `/api/Story` | Create a story |
| `DELETE` | `/api/Story/{storyId}` | Delete a story |

### Notifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Notification` | Get notifications for current user |
| `PUT` | `/api/Notification/{id}/read` | Mark notification as read |

### Hashtags

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Hashtag/trending` | Get trending hashtags |
| `GET` | `/api/Hashtag/{tag}/posts` | Get posts by hashtag |

### Admin Moderation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/AdminModeration/reports` | List reported posts (Admin only) |
| `POST` | `/api/AdminModeration/reports/{reportId}/resolve` | Resolve a report (Admin only) |

### Skills (AI Agents)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/skills/analyze-performance/{postId}` | Aggregate post metrics from Redis + SQL |
| `POST` | `/api/skills/suggest-optimization` | LLM-powered post content optimization |
| `GET` | `/api/skills/trending-topics?category={cat}&limit={n}` | Get trending topics from Redis sorted sets |
| `GET` | `/api/skills` | List registered skill definitions (YAML) |

### Real-time (SignalR)

| Type | Endpoint | Description |
| :--- | :--- | :--- |
| `SignalR Hub` | `/hubs/notification` | Real-time hub for notifications and presence |

**Client events received from server:**

| Event | Payload |
| :--- | :--- |
| `ReceiveMessage` | Direct chat message |
| `ReceiveNotification` | System notification |
| `UserConnected` | Presence — user came online |
| `UserDisconnected` | Presence — user went offline |
| `ReceiveFriendRequest` | Incoming friend request |
| `FriendRequestAccepted` | Friend request was accepted |

**Connecting with token (SignalR):**
```
ws://localhost/hubs/notification?access_token=<JWT>
```

---

## Environment Variables

Copy `.env.example` to `.env` inside `InteractHub_API/`:

```bash
cp InteractHub_API/.env.example InteractHub_API/.env
```

| Variable | Description |
| :--- | :--- |
| `MSSQL_SA_PASSWORD` | SQL Server SA password |
| `Jwt__SecretKey` | JWT signing key (min. 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEO4J_PASSWORD` | Neo4j password (default: `InteractHub123`) |
| `SeedData__Enabled` | `true` to run identity seeder on startup |
| `SeedUsers__Admin__Email` | Admin seed account email |
| `SeedUsers__Admin__Password` | Admin seed account password |
| `SeedUsers__Admin__TenTaiKhoan` | Admin seed account username |
| `LLM__OpenAI__ApiKey` | LLM API key (OpenAI-compatible) |
| `LLM__OpenAI__Model` | LLM model name (default: `gemini-2.0-flash`) |
| `LLM__OpenAI__BaseUrl` | LLM base URL (default: Google Generative Language API) |
| `VITE_API_URL` | Frontend API base URL |
| `VITE_SIGNALR_URL` | Frontend SignalR hub URL |

---

## Running with Docker

All services (API, Worker, SQL Server, Redis, Neo4j, Nginx) are orchestrated by Docker Compose.

```bash
# 1. Set up environment
cp InteractHub_API/.env.example InteractHub_API/.env
# Edit .env with your credentials

# 2. Start the full stack (1 replica)
cd InteractHub_API
docker compose up -d

# 3. Scale API to 3 replicas
docker compose up --scale api=3 -d

# 4. View logs
docker compose logs -f api

# 5. Stop
docker compose down
```

**Service ports exposed to host:**

| Service | Port |
| :--- | :--- |
| Nginx (HTTP entry point) | `80`, `5153` |
| SQL Server | `1433` |
| Redis | `6379` |
| Neo4j Browser | `7474` |
| Neo4j Bolt | `7687` |

API replicas do **not** expose ports directly — all traffic is routed through Nginx.

**Swagger UI** (development only): `http://localhost/swagger`

---

## Local Development

### Prerequisites

- .NET 10 SDK
- Node.js 20 LTS
- Docker Desktop (for SQL Server, Redis, Neo4j)
- SQL Server 2022 (or use the Docker service)

### Backend

```bash
# 1. Start infrastructure services only
cd InteractHub_API
docker compose up sqlserver redis neo4j -d

# 2. Set environment
cp .env.example .env
# Fill in MSSQL_SA_PASSWORD, Jwt__SecretKey, CLOUDINARY_*, NEO4J_PASSWORD

# 3. Run API (migrations applied automatically on startup)
dotnet run --project InteractHub_API/InteractHub_API.csproj

# 4. Run Worker (separate terminal)
dotnet run --project InteractHub_Worker/InteractHub_Worker.csproj
```

The API runs on `http://localhost:5153` by default (or `http://localhost:8080` inside Docker).

Migrations are applied automatically at startup via `database.MigrateAsync()`.  
To add a new migration manually:

```bash
dotnet ef migrations add <MigrationName> \
  --project InteractHub_Shared \
  --startup-project InteractHub_API
```

### Frontend

```bash
cd ClientApp
cp .env.example .env
# Set VITE_API_URL and VITE_SIGNALR_URL

npm install
npm run dev
```

---

## Testing

### Unit Tests

```bash
dotnet test InteractHub_API.UnitTests/
```

Covered:
- `RateLimitingMiddlewareTests` — sliding window rate limiter behavior
- `CloudinaryUrlHelperTests` — URL transformation logic
- `CacheExtensionsTests` — Redis cache extension methods
- `SkillServicesTests` — Skills registry and LLM skill execution

### Integration Tests

```bash
dotnet test InteractHub_API.IntegrationTests/
```

### E2E Tests (Playwright)

```bash
cd ClientApp
npx playwright test
```

---

## Benchmark Results

Tested with `benchmark.js` (Node.js, no external dependencies) against a Docker Compose setup running 1–3 API replicas behind Nginx `least_conn`.

### Load Balancing: Round-robin vs Least-conn (C=20)

| Metric | Round-robin | `least_conn` |
| :--- | :--- | :--- |
| avg latency | ~6,000ms | ~240ms |
| max latency | ~6,000ms | ~1,000ms |
| Throughput | ~3,000 req/s | ~5,600 req/s |

### Concurrency: 1 replica — C=20 vs C=50

| Endpoint | C=20 Throughput | C=50 Throughput | C=20 p99 | C=50 p99 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/post/feed` | 5,690 req/s | 5,225 req/s | 36ms | 84ms |
| `/api/profile/me` | 3,812 req/s | 4,204 req/s | 65ms | 80ms |

Sweet spot: **C=20 with 1 replica** (~5,690 req/s, avg 3.6ms).

### 1 Replica vs 3 Replicas (C=20)

| Endpoint | 1 replica | 3 replicas | 429 Rate |
| :--- | :--- | :--- | :--- |
| `/api/post/feed` | 5,690 req/s (99.9% 429) | 772 req/s (0% 429) | Eliminated |
| `/api/profile/me` | 3,812 req/s (99.9% 429) | 1,125 req/s (0% 429) | Eliminated |

3 replicas eliminates rate limit errors because each replica has its own quota window. All requests execute full business logic (~25ms avg = DB ~8ms + cache ~2ms + serialization ~3ms + network ~12ms).

Full benchmark report: [BENCHMARK_REPORT.md](./BENCHMARK_REPORT.md)
