#!/usr/bin/env node
/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │          InteractHub API — Benchmark Script                 │
 * │  Node.js built-in only, không cần cài thêm package         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Cách dùng:
 *   node benchmark.js [options]
 *
 * Options (env vars hoặc chỉnh trực tiếp trong CONFIG):
 *   BASE_URL      - URL gốc (default: http://localhost)
 *   DURATION      - Thời gian chạy mỗi test (giây, default: 15)
 *   CONCURRENCY   - Số request song song   (default: 20)
 *   JWT_TOKEN     - Bearer token nếu endpoint cần auth
 *
 * Ví dụ:
 *   node benchmark.js
 *   BASE_URL=http://localhost:5153 CONCURRENCY=50 node benchmark.js
 *   JWT_TOKEN=eyJ... node benchmark.js
 */

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

// ─── Load .env.benchmark (nếu có) ────────────────────────────────────────────
(function loadEnv() {
  const envFile = path.join(__dirname, '.env.benchmark');
  if (!fs.existsSync(envFile)) return;

  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;          // bỏ comment và dòng trống
    const sep = line.indexOf('=');
    if (sep <= 0) continue;
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, ''); // bỏ quotes
    if (key && !(key in process.env)) {                   // env var thật > file
      process.env[key] = val;
    }
  }
})();

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  baseUrl     : process.env.BASE_URL    || 'http://localhost',
  duration    : Number(process.env.DURATION)     || 15,   // giây mỗi test
  concurrency : Number(process.env.CONCURRENCY)  || 5,    // ⚠️ giữ thấp để không trigger rate limit
  jwtToken    : process.env.JWT_TOKEN   || '',
  timeout     : 10_000, // ms
};

/** Danh sách endpoints cần benchmark.
 *  method  : GET | POST | PUT | DELETE
 *  path    : đường dẫn tương đối
 *  body    : object (sẽ JSON.stringify) — chỉ dùng cho POST/PUT
 *  label   : tên hiển thị trong báo cáo
 *  auth    : true nếu cần Bearer token
 */
const ENDPOINTS = [
  {
    label  : 'Health check (nginx)',
    method : 'GET',
    path   : '/health',
    auth   : false,
  },
  {
    // GET /api/post/{postId} — xem 1 bài cụ thể, thay postId thật vào đây
    label  : 'GET /api/post/feed (public feed)',
    method : 'GET',
    path   : '/api/post/feed',
    auth   : true,
  },
  {
    // GET /api/profile/me — lấy profile của chính mình
    label  : 'GET /api/profile/me (own profile)',
    method : 'GET',
    path   : '/api/profile/me',
    auth   : true,
  },
  // ── Thêm tuỳ ý ───────────────────────────────────────────────────
  // {
  //   label  : 'GET /api/profile/{userId}',
  //   method : 'GET',
  //   path   : '/api/profile/PASTE_USER_ID_HERE',
  //   auth   : true,
  // },
  // {
  //   label  : 'POST /api/auth/login',
  //   method : 'POST',
  //   path   : '/api/auth/login',
  //   auth   : false,
  //   body   : { email: 'test@example.com', password: 'Test@123' },
  // },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const GRAY   = '\x1b[90m';
const BLUE   = '\x1b[34m';

const c = {
  bold  : (s) => `${BOLD}${s}${RESET}`,
  green : (s) => `${GREEN}${s}${RESET}`,
  yellow: (s) => `${YELLOW}${s}${RESET}`,
  red   : (s) => `${RED}${s}${RESET}`,
  cyan  : (s) => `${CYAN}${s}${RESET}`,
  gray  : (s) => `${GRAY}${s}${RESET}`,
  blue  : (s) => `${BLUE}${s}${RESET}`,
};

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function fmtMs(ms) {
  if (ms === Infinity || isNaN(ms)) return c.gray('N/A');
  if (ms < 1)    return c.green(`${ms.toFixed(2)}ms`);
  if (ms < 100)  return c.green(`${ms.toFixed(1)}ms`);
  if (ms < 500)  return c.yellow(`${ms.toFixed(1)}ms`);
  return c.red(`${ms.toFixed(1)}ms`);
}

function fmtRps(rps) {
  if (rps >= 1000) return c.green(`${rps.toFixed(0)} req/s`);
  if (rps >= 100)  return c.yellow(`${rps.toFixed(1)} req/s`);
  return c.red(`${rps.toFixed(1)} req/s`);
}

function fmtPct(pct) {
  if (pct === 0)   return c.green('0%');
  if (pct < 1)     return c.yellow(`${pct.toFixed(2)}%`);
  return c.red(`${pct.toFixed(2)}%`);
}

function bar(value, max, width = 20) {
  if (!max || max <= 0) return c.gray('░'.repeat(width));
  const filled = Math.min(width, Math.max(0, Math.round((value / max) * width)));
  return c.cyan('█'.repeat(filled)) + c.gray('░'.repeat(width - filled));
}

// ─── HTTP REQUEST ─────────────────────────────────────────────────────────────
function request(urlStr, method, headers, bodyStr, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === 'https:' ? https : http;

    const options = {
      hostname : parsed.hostname,
      port     : parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path     : parsed.pathname + parsed.search,
      method,
      headers,
      timeout  : timeoutMs,
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ ok: true, status: res.statusCode, latency: Date.now() - start, body });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, latency: timeoutMs, error: 'timeout' });
    });
    req.on('error', (err) => {
      resolve({ ok: false, status: 0, latency: Date.now() - start, error: err.message });
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── SINGLE ENDPOINT BENCHMARK ───────────────────────────────────────────────
async function benchmarkEndpoint(endpoint) {
  const { label, method, path, auth, body } = endpoint;

  // Skip auth endpoints nếu không có token
  if (auth && !CONFIG.jwtToken) {
    return { label, skipped: true, reason: 'Không có JWT_TOKEN' };
  }

  const url = CONFIG.baseUrl + path;
  const bodyStr = body ? JSON.stringify(body) : null;

  const headers = {
    'Content-Type' : 'application/json',
    'Accept'       : 'application/json',
    'Connection'   : 'keep-alive',
  };
  if (auth && CONFIG.jwtToken) {
    headers['Authorization'] = `Bearer ${CONFIG.jwtToken}`;
  }
  if (bodyStr) {
    headers['Content-Length'] = Buffer.byteLength(bodyStr);
  }

  const latencies   = [];
  const statusCodes = {};
  let errors        = 0;
  let totalRequests = 0;

  const endTime = Date.now() + CONFIG.duration * 1000;

  // Chạy N "worker" song song liên tục cho đến hết thời gian
  const workers = Array.from({ length: CONFIG.concurrency }, async () => {
    while (Date.now() < endTime) {
      const result = await request(url, method, headers, bodyStr, CONFIG.timeout);
      totalRequests++;

      if (result.ok) {
        latencies.push(result.latency);
        statusCodes[result.status] = (statusCodes[result.status] || 0) + 1;
        if (result.status >= 500) errors++;
      } else {
        errors++;
        statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;
      }
    }
  });

  await Promise.all(workers);

  latencies.sort((a, b) => a - b);
  const totalTime = CONFIG.duration;
  const rps       = totalRequests / totalTime;
  const errPct    = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

  return {
    label,
    skipped : false,
    total   : totalRequests,
    rps,
    errors,
    errPct,
    statusCodes,
    latency : {
      min  : latencies[0]              || 0,
      max  : latencies.at(-1)          || 0,
      avg  : latencies.length > 0
               ? latencies.reduce((a, b) => a + b, 0) / latencies.length
               : 0,
      p50  : percentile(latencies, 50),
      p75  : percentile(latencies, 75),
      p95  : percentile(latencies, 95),
      p99  : percentile(latencies, 99),
    },
  };
}

// ─── LOAD BALANCING CHECK ────────────────────────────────────────────────────
async function checkLoadBalancing() {
  const results  = [];
  const url      = CONFIG.baseUrl + '/health';   // nginx health endpoint
  const headers  = { 'Accept': 'application/json' };
  const COUNT    = 20;

  process.stdout.write(c.gray(`  Gửi ${COUNT} request để kiểm tra phân phối...`));

  for (let i = 0; i < COUNT; i++) {
    const r = await request(url, 'GET', headers, null, CONFIG.timeout);
    // API thường trả X-Handled-By hoặc hostname trong header
    // Ở đây ta chỉ check status để biết có phân phối không
    results.push({ status: r.status, latency: r.latency });
  }

  console.log(' done\n');
  return results;
}

// ─── PRINT ────────────────────────────────────────────────────────────────────
function printHeader() {
  const line = '═'.repeat(68);
  console.log('\n' + c.cyan(line));
  console.log(c.bold(c.cyan('  🚀  InteractHub API Benchmark')));
  console.log(c.gray(`  Base URL    : ${CONFIG.baseUrl}`));
  console.log(c.gray(`  Concurrency : ${CONFIG.concurrency} workers song song`));
  console.log(c.gray(`  Duration    : ${CONFIG.duration}s mỗi endpoint`));
  console.log(c.gray(`  Auth token  : ${CONFIG.jwtToken ? 'có ✓' : 'không có'}`));
  console.log(c.cyan(line) + '\n');
}

function printResult(r) {
  if (r.skipped) {
    console.log(`  ${c.yellow('⏭  SKIP')} ${c.bold(r.label)}`);
    console.log(c.gray(`       Lý do: ${r.reason}\n`));
    return;
  }

  const maxLatency = r.latency.max || r.latency.p99 || 1;
  const line = '─'.repeat(68);

  console.log(`\n  ${c.bold(c.blue('▶'))} ${c.bold(r.label)}`);
  console.log(c.gray('  ' + line));

  // Throughput & errors
  console.log(`  ${'Tổng request'.padEnd(14)} : ${c.bold(r.total.toLocaleString())}`);
  console.log(`  ${'Throughput'.padEnd(14)} : ${fmtRps(r.rps)}`);
  console.log(`  ${'Lỗi'.padEnd(14)} : ${fmtPct(r.errPct)} (${r.errors} req)`);

  // Status codes
  const codes = Object.entries(r.statusCodes)
    .map(([k, v]) => `${k}×${v}`)
    .join('  ');
  console.log(`  ${'Status codes'.padEnd(14)} : ${c.gray(codes)}`);

  // Latency table
  console.log(c.gray('\n  Latency:'));
  const rows = [
    ['min', r.latency.min],
    ['avg', r.latency.avg],
    ['p50', r.latency.p50],
    ['p75', r.latency.p75],
    ['p95', r.latency.p95],
    ['p99', r.latency.p99],
    ['max', r.latency.max],
  ];
  for (const [name, val] of rows) {
    const b = bar(val, maxLatency > 0 ? maxLatency : 1);
    console.log(`    ${name.padEnd(4)} ${b}  ${fmtMs(val)}`);
  }
}

function printSummary(results) {
  const valid = results.filter((r) => !r.skipped);
  if (valid.length === 0) return;

  const totalRps = valid.reduce((s, r) => s + r.rps, 0);
  const avgP99   = valid.reduce((s, r) => s + r.latency.p99, 0) / valid.length;
  const hasError = valid.some((r) => r.errPct > 0);

  const line = '═'.repeat(68);
  console.log('\n' + c.cyan(line));
  console.log(c.bold(c.cyan('  📊  Tổng kết')));
  console.log(c.gray('  ' + line));
  console.log(`  Tổng throughput (cộng dồn) : ${fmtRps(totalRps)}`);
  console.log(`  P99 latency trung bình     : ${fmtMs(avgP99)}`);
  console.log(`  Có lỗi                     : ${hasError ? c.red('Có ⚠') : c.green('Không ✓')}`);
  console.log(c.cyan(line) + '\n');

  // Xếp hạng theo RPS
  const sorted = [...valid].sort((a, b) => b.rps - a.rps);
  console.log(c.bold('  Xếp hạng theo throughput:'));
  const maxRps = sorted[0]?.rps || 1;
  sorted.forEach((r, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    const b = bar(r.rps, maxRps, 16);
    console.log(`  ${medal} ${b}  ${fmtRps(r.rps).padEnd(18)}  ${c.gray(r.label)}`);
  });
  console.log();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  printHeader();

  // Quick connectivity check
  process.stdout.write(c.gray('  Kiểm tra kết nối tới server... '));
  const ping = await request(
    CONFIG.baseUrl + '/health',
    'GET',
    { Accept: 'text/plain' },
    null,
    3000,
  );
  if (!ping.ok || ping.status === 0) {
    console.log(c.red(`FAIL (${ping.error || ping.status})`));
    console.log(c.red('\n  ⛔  Không kết nối được. Kiểm tra Docker đang chạy chưa?\n'));
    process.exit(1);
  }
  console.log(c.green(`OK (${ping.status}, ${ping.latency}ms)\n`));

  // Load balancing quick-check
  console.log(c.bold('  🔀  Kiểm tra load balancing qua Nginx:'));
  const lbResults = await checkLoadBalancing();
  const ok200 = lbResults.filter((r) => r.status === 200).length;
  const lbAvg = lbResults.reduce((s, r) => s + r.latency, 0) / lbResults.length;
  console.log(`  ${c.green('✓')} ${ok200}/${lbResults.length} request thành công, avg latency ${fmtMs(lbAvg)}`);
  console.log(c.gray('  (Nginx round-robin đang hoạt động nếu traffic phân đều)\n'));

  // Benchmark từng endpoint
  const allResults = [];
  for (const ep of ENDPOINTS) {
    const skip = ep.auth && !CONFIG.jwtToken;
    const status = skip ? c.yellow('SKIP') : c.cyan('RUN ');
    process.stdout.write(`  ${status}  ${ep.label} ... `);

    if (skip) {
      console.log(c.gray('(cần JWT_TOKEN)'));
      allResults.push({ label: ep.label, skipped: true, reason: 'Không có JWT_TOKEN' });
      continue;
    }

    const result = await benchmarkEndpoint(ep);
    allResults.push(result);
    console.log(c.green('done'));
    printResult(result);
  }

  printSummary(allResults);

  console.log(c.gray('  Tip: Scale API rồi chạy lại để so sánh hiệu năng:'));
  console.log(c.gray('    docker compose up --scale api=3 -d'));
  console.log(c.gray('    node benchmark.js\n'));
}

main().catch((err) => {
  console.error(c.red('\n  ⛔  Lỗi không mong đợi:'), err);
  process.exit(1);
});
