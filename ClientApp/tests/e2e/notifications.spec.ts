import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://127.0.0.1:5153/api';
const STATE_FILE = path.join(__dirname, '.auth/user.json');

function token(): string {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const raw = state.origins[0]?.localStorage?.find((e: { name: string }) => e.name === 'auth')?.value;
  if (!raw) throw new Error('No auth state');
  return JSON.parse(raw).accessToken as string;
}

test('TC-NF-01: list notifications and mark all as read', async ({ request }) => {
  const t = token();
  const list = await request.get(`${API_BASE}/Notification`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  expect(list.ok(), await list.text()).toBeTruthy();

  const markAll = await request.patch(`${API_BASE}/Notification/read-all`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  expect(markAll.ok(), await markAll.text()).toBeTruthy();
});
