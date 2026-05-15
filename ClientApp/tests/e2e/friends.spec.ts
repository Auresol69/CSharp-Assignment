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

test('TC-FR-01: friends list/requests/suggestions can be fetched', async ({ request }) => {
  const { accessToken } = authState();
  for (const path of ['/friends/list', '/friends/requests', '/friends/suggestions']) {
    const res = await request.get(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.ok(), `${path}: ${await res.text()}`).toBeTruthy();
  }
});

test('TC-FR-02: cannot send friend request to self', async ({ request }) => {
  const { accessToken, user } = authState();
  const res = await request.post(`${API_BASE}/friends/request/${user.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect([400, 401].includes(res.status())).toBeTruthy();
});
