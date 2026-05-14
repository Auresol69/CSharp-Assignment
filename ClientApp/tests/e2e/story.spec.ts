/**
 * story.spec.ts
 *
 * Test case: Đăng Story và kiểm tra thời hạn 24h
 *
 * Luồng:
 *  1. Gọi POST /api/story với multipart (ảnh fixture + caption).
 *  2. Assert response 200/201 + trả về idStory, expiresAt.
 *  3. Verify expiresAt - createdAt ≈ 24h (±60s tolerance cho network latency).
 *  4. Gọi GET /api/story/global để confirm story hiển thị trong feed còn active.
 *  5. Cleanup: xóa story sau test.
 *
 * DB rule (AppDbContext): ExpiresAt = DATEADD(hour, 24, SYSUTCDATETIME())
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://127.0.0.1:5153/api';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const TOLERANCE_MS = 60_000; // ±60 giây

function tiny1x1PngBuffer(): Buffer {
  return Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
      '2e0000000c4944415478016360f8cfc00000000200017e221bc30000000049454e44ae426082',
    'hex'
  );
}

function getTokenFromStorageState(statePath: string): string {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  const authRaw = state.origins[0]?.localStorage?.find(
    (e: { name: string }) => e.name === 'auth'
  )?.value;
  if (!authRaw) throw new Error('No auth token in storageState');
  return JSON.parse(authRaw).accessToken as string;
}

const STATE_FILE = path.join(__dirname, '.auth/user.json');

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Đăng Story', () => {
  let createdStoryId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdStoryId) {
      const token = getTokenFromStorageState(STATE_FILE);
      await request.delete(`${API_BASE}/story/${createdStoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      createdStoryId = null;
    }
  });

  // ── TC-03: Tạo story → ExpiresAt đúng 24h ──────────────────────────────────
  test('TC-03: tạo story → expiresAt đúng 24h từ thời điểm tạo', async ({ request }) => {
    const token = getTokenFromStorageState(STATE_FILE);
    const caption = `[playwright] story ${Date.now()}`;
    const imgBuffer = tiny1x1PngBuffer();

    const beforeCreate = Date.now();

    // 1. Tạo story
    const createRes = await request.post(`${API_BASE}/story`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        Caption: caption,
        MediaFile: {
          name: 'story-test.png',
          mimeType: 'image/png',
          buffer: imgBuffer,
        },
      },
    });

    const afterCreate = Date.now();

    expect(createRes.ok(), `Create story failed: ${await createRes.text()}`).toBeTruthy();
    const story = await createRes.json();

    createdStoryId = story.idStory as string;
    expect(createdStoryId).toBeTruthy();
    expect(story.expiresAt).toBeTruthy();

    // 2. Verify ExpiresAt ≈ 24h từ lúc tạo
    const expiresAt = new Date(story.expiresAt).getTime();

    // expiresAt phải nằm trong khoảng [beforeCreate+24h, afterCreate+24h] ±tolerance
    const minExpected = beforeCreate + TWENTY_FOUR_HOURS_MS - TOLERANCE_MS;
    const maxExpected = afterCreate + TWENTY_FOUR_HOURS_MS + TOLERANCE_MS;

    expect(
      expiresAt,
      `ExpiresAt ${new Date(expiresAt).toISOString()} không nằm trong khoảng 24h ±60s`
    ).toBeGreaterThanOrEqual(minExpected);

    expect(
      expiresAt,
      `ExpiresAt ${new Date(expiresAt).toISOString()} vượt quá 24h+60s`
    ).toBeLessThanOrEqual(maxExpected);

    console.log(
      `✓ ExpiresAt = ${new Date(expiresAt).toISOString()} | diff = ${(expiresAt - beforeCreate) / 3_600_000} giờ`
    );
  });

  // ── TC-04: Story mới tạo hiển thị trong GET /story/global ──────────────────
  test('TC-04: story mới tạo xuất hiện trong global feed (còn active)', async ({ request }) => {
    const token = getTokenFromStorageState(STATE_FILE);
    const caption = `[playwright] visible story ${Date.now()}`;
    const imgBuffer = tiny1x1PngBuffer();

    // 1. Tạo story
    const createRes = await request.post(`${API_BASE}/story`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        Caption: caption,
        MediaFile: {
          name: 'story-visible.png',
          mimeType: 'image/png',
          buffer: imgBuffer,
        },
      },
    });

    expect(createRes.ok(), `Create story failed: ${await createRes.text()}`).toBeTruthy();
    const story = await createRes.json();
    createdStoryId = story.idStory as string;

    // 2. Lấy global stories và tìm story vừa tạo
    const listRes = await request.get(`${API_BASE}/story/global`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { take: '50' },
    });

    expect(listRes.ok()).toBeTruthy();
    const body = await listRes.json();
    const stories: Array<{ idStory: string; expiresAt: string }> = body.data ?? body;

    const found = stories.find((s) => s.idStory === createdStoryId);
    expect(found, `Story ${createdStoryId} không tìm thấy trong global feed`).toBeDefined();

    // 3. ExpiresAt phải ở tương lai (story còn active)
    const expiresAt = new Date(found!.expiresAt).getTime();
    expect(expiresAt, 'Story đã hết hạn ngay sau khi tạo!').toBeGreaterThan(Date.now());
  });
});
