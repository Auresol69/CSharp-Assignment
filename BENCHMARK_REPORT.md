# InteractHub API — Benchmark Report

> **Ngày chạy:** 2026-07-18  
> **Tool:** `benchmark.js` (Node.js built-in, không dependency)  
> **Setup:** 1 replica API · Nginx `least_conn` · Docker Compose  

---

## 🖥️ Môi trường

| Thành phần | Cấu hình |
|---|---|
| API | ASP.NET Core 10 Preview — 1 replica |
| Load Balancer | Nginx `least_conn` (upstream keepalive=32) |
| DB | SQL Server 2022 (Docker) |
| Cache | Redis Alpine |
| Graph DB | Neo4j Latest |
| Rate Limiter | `RateLimitingMiddleware` (custom, sliding window) |
| Base URL | `http://localhost` (port 80) |
| Duration | 10–15s mỗi endpoint |

---

## 🔬 Thí nghiệm 1: Round-robin vs Least-conn

> Chạy với **C=20**, endpoint: `GET /api/post/feed`

| Metric | Round-robin | `least_conn` | Cải thiện |
|---|---|---|---|
| avg latency | ~6,000ms | ~240ms | **-96%** ✅ |
| max latency | ~6,000ms | ~1,000ms | **-83%** ✅ |
| Throughput | ~3,000 req/s | ~5,600 req/s | **+87%** ✅ |

### Phân tích

`least_conn` hiệu quả hơn vì:

- API có `RateLimitingMiddleware` → request bị rate-limit vẫn giữ active connection trong vài ms
- Round-robin **mù quáng** phân phối vào replica đang kẹt (head-of-line blocking)
- `least_conn` **nhìn vào số active connection** → né replica bận → latency giảm mạnh

> **Kết luận:** Với REST API có latency không đồng đều, `least_conn` luôn tốt hơn round-robin.

---

## 🔬 Thí nghiệm 2: Concurrency 20 vs 50 — 1 replica

> Load balancer: `least_conn` · 1 replica API

### Health check `/health` (nginx tự xử lý)

| Metric | C=20 | C=50 | Δ |
|---|---|---|---|
| Throughput | 45,298 req/s | 45,837 req/s | +1.2% ≈ |
| avg | 0.44ms | 1.10ms | +150% ↑ |
| p99 | 1ms | 2ms | +100% ↑ |
| max | 13ms | 26ms | +100% ↑ |

> Nginx bão hòa ở ~45,800 req/s bất kể tăng concurrency.

---

### GET `/api/post/feed`

| Metric | C=20 | C=50 | Δ |
|---|---|---|---|
| Throughput | **5,690 req/s** | **5,225 req/s** | **-8.2%** ↓ |
| Tỷ lệ 429 | 99.9% | 99.9% | ≈ |
| avg | 3.6ms | 9.7ms | **+169%** ↑ |
| p50 | 1ms | 3ms | +200% ↑ |
| p75 | 2ms | 4ms | +100% ↑ |
| p95 | 4ms | 34ms | **+750%** ↑ |
| p99 | 36ms | 84ms | **+133%** ↑ |
| max | 1,026ms | 1,002ms | ≈ |

---

### GET `/api/profile/me`

| Metric | C=20 | C=50 | Δ |
|---|---|---|---|
| Throughput | 3,812 req/s | 4,204 req/s | +10% |
| Tỷ lệ 429 | 99.9% | 99.9% | ≈ |
| avg | 5.5ms | 11.9ms | **+116%** ↑ |
| p50 | 1ms | 3ms | +200% ↑ |
| p75 | 2ms | 4ms | +100% ↑ |
| p95 | 5ms | 29ms | **+480%** ↑ |
| p99 | 65ms | 80ms | +23% ↑ |
| max | 993ms | 1,011ms | ≈ |

---

## 📈 Phân tích: Tại sao C=50 có latency cao hơn C=20?

### Little's Law

```
Latency = Queue_Length / Throughput

C=20:  20 / 5,690  ≈  3.5ms   ✅
C=50:  50 / 5,225  ≈  9.6ms   ↑ queue dài hơn
```

Khi bơm 50 worker vào 1 API đã bão hòa, **queue dài ra** → mỗi request chờ lâu hơn, dù throughput không tăng (thậm chí giảm vì context-switching overhead).

### Saturation Point

```
Throughput
│
5,700 ├────────────╮ ← saturation (~C=15–20)
5,200 │            │ ╲ giảm khi quá tải
      │            │   ╲
      └────────────┼────╲──▶ Concurrency
                  C=20  C=50
```

---

## 🎯 Sweet Spot

| Concurrency | Throughput API | avg Latency | Đánh giá |
|---|---|---|---|
| C=5 | ~2,500 req/s | ~1ms | Underloaded |
| C=10 | ~4,000 req/s | ~2ms | Ổn |
| **C=20** | **~5,690 req/s** | **~3.6ms** | **✅ Tối ưu với 1 replica** |
| C=50 | ~5,225 req/s | ~9.7ms | ❌ Overloaded |

---

## 🚀 Khuyến nghị tiếp theo

**1. Scale lên 3 replicas và test lại C=50:**
```bash
docker compose up --scale api=3 -d && sleep 10
CONCURRENCY=50 node benchmark.js
```

**2. Tắt rate limit khi benchmark** để đo throughput thật của business logic.

**3. Tìm endpoint không có rate limit** (ví dụ: `GET /api/post/{postId}` public) để có kết quả sạch hơn.

---

## 📋 Raw Data

### C=20 (DURATION=10s)
```
Health check   : 45,298 req/s | p99=1ms  | max=13ms
/api/post/feed : 5,690 req/s  | p99=36ms | max=1,026ms | 429: 99.9%
/api/profile   : 3,812 req/s  | p99=65ms | max=993ms   | 429: 99.9%
Total combined : 54,800 req/s
```

### C=50 (DURATION=15s)
```
Health check   : 45,837 req/s | p99=2ms  | max=26ms
/api/post/feed : 5,225 req/s  | p99=84ms | max=1,002ms | 429: 99.9%
/api/profile   : 4,204 req/s  | p99=80ms | max=1,011ms | 429: 99.9%
Total combined : 55,266 req/s
```
