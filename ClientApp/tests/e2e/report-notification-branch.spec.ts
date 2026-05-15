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
  if (!raw) throw new Error(`No auth state: ${stateFile}`);
  return JSON.parse(raw).accessToken as string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

test('TC-RN-01: report > 5 moves post to blacklist (admin moderation view)', async ({ request }) => {
  const userToken = token(USER_STATE);
  const adminToken = token(ADMIN_STATE);

  const createPost = await request.post(`${API_BASE}/Post`, {
    headers: { Authorization: `Bearer ${userToken}` },
    multipart: { Content: `[pw] report-notify-branch ${Date.now()}` },
  });
  expect(createPost.status(), await createPost.text()).toBe(201);
  const created = await createPost.json();
  const postId = created.idPost as string;

  try {
    for (let i = 1; i <= 6; i++) {
      const res = await request.post(`${API_BASE}/Post/${postId}/report`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { reason: `[pw] report ${i}` },
      });
      expect(res.status(), `report #${i}: ${await res.text()}`).toBe(200);
      await sleep(1200);
    }

    await sleep(1000);

    const reported = await request.get(`${API_BASE}/admin/moderation/reported-posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(reported.ok(), await reported.text()).toBeTruthy();
    const list = (await reported.json()) as Array<{ postId: string; isBlacklisted: boolean; reportCount: number }>;

    const row = list.find((x) => x.postId === postId);
    expect(row).toBeTruthy();
    expect(row!.isBlacklisted).toBeTruthy();
    expect(row!.reportCount).toBeGreaterThanOrEqual(6);
  } finally {
    await request.delete(`${API_BASE}/admin/moderation/posts/${postId}/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await request.delete(`${API_BASE}/Post/${postId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  }
});
