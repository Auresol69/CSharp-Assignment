/**
 * auth.setup.ts
 *
 * Chạy một lần trước toàn bộ test suite.
 * - Đăng nhập user thường (register nếu chưa tồn tại) → lưu storageState
 * - Đăng nhập Admin (từ seed data) → lưu storageState riêng
 *
 * Tất cả thông tin xác thực được lưu vào file JSON để
 * các test dùng lại mà không cần login lại mỗi lần.
 */

import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://127.0.0.1:5153/api';

// Seed user (từ IdentitySeeder / .env)
const ADMIN = {
  email: 'admin@interacthub.local',
  password: 'Admin@12345',
};

// Regular test user – dùng timestamp để tránh conflict khi chạy nhiều lần
const TEST_USER = {
  email: `testuser_pw@interacthub.local`,
  password: 'TestUser@12345',
  tenTaiKhoan: 'playwright_user',
};

const AUTH_DIR = path.join(__dirname, '.auth');

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginViaApi(
  request: import('@playwright/test').APIRequestContext,
  email: string,
  password: string
) {
  const res = await request.post(`${API_BASE}/Auth/login`, {
    data: { email, password },
  });
  expect(res.ok(), `Login failed for ${email}: ${await res.text()}`).toBeTruthy();
  return (await res.json()) as { accessToken: string; user: Record<string, unknown> };
}

function buildStorageState(token: string, user: Record<string, unknown>) {
  const authPayload = JSON.stringify({ accessToken: token, user });
  return {
    cookies: [] as [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [{ name: 'auth', value: authPayload }],
      },
    ],
  };
}

// ─── Setup: Regular User ─────────────────────────────────────────────────────

setup('auth: register & save regular user session', async ({ request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // Thử login trước – nếu user đã tồn tại thì dùng luôn
  let token: string;
  let user: Record<string, unknown>;

  const tryLogin = await request.post(`${API_BASE}/Auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });

  if (tryLogin.ok()) {
    ({ accessToken: token, user } = await tryLogin.json());
  } else {
    // Chưa tồn tại → đăng ký mới
    const reg = await request.post(`${API_BASE}/Auth/register`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password,
        tenTaiKhoan: TEST_USER.tenTaiKhoan,
      },
    });
    expect(reg.ok(), `Register failed: ${await reg.text()}`).toBeTruthy();
    ({ accessToken: token, user } = await reg.json());
  }

  fs.writeFileSync(
    path.join(AUTH_DIR, 'user.json'),
    JSON.stringify(buildStorageState(token, user), null, 2)
  );
  console.log(`✓ Regular user session saved (${TEST_USER.email})`);
});

// ─── Setup: Admin ────────────────────────────────────────────────────────────

setup('auth: login admin & save admin session', async ({ request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { accessToken: token, user } = await loginViaApi(request, ADMIN.email, ADMIN.password);

  fs.writeFileSync(
    path.join(AUTH_DIR, 'admin.json'),
    JSON.stringify(buildStorageState(token, user), null, 2)
  );
  console.log(`✓ Admin session saved`);
});
