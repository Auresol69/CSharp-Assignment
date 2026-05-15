import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://127.0.0.1:5153/api';
const STATE_FILE = path.join(__dirname, '.auth/user.json');

function authState() {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const raw = state.origins[0]?.localStorage?.find((e: { name: string }) => e.name === 'auth')?.value;
  if (!raw) throw new Error('No auth state');
  return JSON.parse(raw) as { accessToken: string; user: { id: string } };
}

test('TC-PF-01: profile me + update profile', async ({ request }) => {
  const { accessToken } = authState();

  const me = await request.get(`${API_BASE}/Profile/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(me.ok(), await me.text()).toBeTruthy();

  const payload = { bio: `[pw] bio ${Date.now()}` };
  const upd = await request.put(`${API_BASE}/Profile/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: payload,
  });

  expect(upd.ok(), await upd.text()).toBeTruthy();
  const body = await upd.json();
  expect((body.bio ?? '').toString()).toContain('[pw] bio');
});

test('TC-PF-02: change password wrong current password -> 400', async ({ request }) => {
  const { accessToken } = authState();
  const res = await request.post(`${API_BASE}/Profile/change-password`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      currentPassword: 'Wrong@12345',
      newPassword: 'NewPass@12345',
    },
  });

  expect(res.status()).toBe(400);
});
