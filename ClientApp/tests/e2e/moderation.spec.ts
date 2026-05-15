import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://127.0.0.1:5153/api';
const USER_STATE = path.join(__dirname, '.auth/user.json');
const ADMIN_STATE = path.join(__dirname, '.auth/admin.json');

function token(stateFile: string): string {
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  const raw = state.origins[0]?.localStorage?.find((e: { name: string }) => e.name === 'auth')?.value;
  if (!raw) throw new Error('No auth state');
  return JSON.parse(raw).accessToken as string;
}

test('TC-MD-01: non-admin cannot access moderation endpoint', async ({ request }) => {
  const userToken = token(USER_STATE);
  const res = await request.get(`${API_BASE}/admin/moderation/reported-posts`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  expect([401, 403].includes(res.status())).toBeTruthy();
});

test('TC-MD-02: admin can access moderation endpoint', async ({ request }) => {
  const adminToken = token(ADMIN_STATE);
  const res = await request.get(`${API_BASE}/admin/moderation/reported-posts`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  expect(res.ok(), await res.text()).toBeTruthy();
});
