/**
 * post.spec.ts
 *
 * Test case: Đăng bài (Post) với Text + Image
 *
 * Luồng:
 *  1. Dùng Playwright APIRequestContext (có JWT từ storageState) gọi thẳng
 *     POST /api/post với multipart/form-data (text + file ảnh fixture).
 *  2. Assert response 201 + trả về idPost.
 *  3. Gọi GET /api/post/{id} để verify bài đã vào DB với đúng content & media.
 *  4. Cleanup: xóa bài sau test.
 *
 * Ưu tiên API call trực tiếp — không lặp lại UI flow của E2E browser test.
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://127.0.0.1:5153/api';

// ── Fixture: ảnh nhỏ 1x1 px PNG để upload (không cần file thật) ──────────────
function tiny1x1PngBuffer(): Buffer {
  // PNG header + IHDR + IDAT (1x1 đen) + IEND — hợp lệ theo spec PNG
  return Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
      '2e0000000c4944415478016360f8cfc00000000200017e221bc30000000049454e44ae426082',
    'hex'
  );
}

// Lấy token từ storageState file mà setup đã ghi
function getTokenFromStorageState(statePath: string): string {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  const authRaw = state.origins[0]?.localStorage?.find(
    (e: { name: string }) => e.name === 'auth'
  )?.value;
  if (!authRaw) throw new Error('No auth token found in storageState');
  return JSON.parse(authRaw).accessToken as string;
}

const STATE_FILE = path.join(__dirname, '.auth/user.json');

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Đăng bài (Post)', () => {
  let createdPostId: string | null = null;

  // Cleanup sau mỗi test để không để rác trong DB
  test.afterEach(async ({ request }) => {
    if (createdPostId) {
      const token = getTokenFromStorageState(STATE_FILE);
      await request.delete(`${API_BASE}/post/${createdPostId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      createdPostId = null;
    }
  });

  // ── TC-01: Đăng bài text thuần ──────────────────────────────────────────────
  test('TC-01: tạo bài text-only → verify qua GET /post/{id}', async ({ request }) => {
    const token = getTokenFromStorageState(STATE_FILE);
    const content = `[playwright] text-only post ${Date.now()}`;

    // 1. Tạo post
    const createRes = await request.post(`${API_BASE}/post`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { Content: content },
    });

    expect(createRes.status(), `Create post failed: ${await createRes.text()}`).toBe(201);
    const created = await createRes.json();
    createdPostId = created.idPost as string;
    expect(createdPostId).toBeTruthy();

    // 2. Verify trong DB qua GET
    const getRes = await request.get(`${API_BASE}/post/${createdPostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getRes.ok()).toBeTruthy();
    const post = await getRes.json();

    expect(post.content).toBe(content);
    expect(post.media).toHaveLength(0); // Không có media
  });

  // ── TC-02: Đăng bài có Text + Image ─────────────────────────────────────────
  test('TC-02: tạo bài text + image → verify media tồn tại trong DB', async ({ request }) => {
    const token = getTokenFromStorageState(STATE_FILE);
    const content = `[playwright] post with image ${Date.now()}`;
    const imgBuffer = tiny1x1PngBuffer();

    // 1. Tạo post với multipart (text + file)
    const createRes = await request.post(`${API_BASE}/post`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        Content: content,
        MediaFiles: {
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: imgBuffer,
        },
      },
    });

    expect(createRes.status(), `Create post with image failed: ${await createRes.text()}`).toBe(
      201
    );
    const created = await createRes.json();
    createdPostId = created.idPost as string;
    expect(createdPostId).toBeTruthy();

    // 2. Verify DB: bài có đúng content và ít nhất 1 media
    const getRes = await request.get(`${API_BASE}/post/${createdPostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getRes.ok()).toBeTruthy();
    const post = await getRes.json();

    expect(post.content).toBe(content);
    expect(post.media.length).toBeGreaterThanOrEqual(1);

    const media = post.media[0];
    expect(media.url).toBeTruthy();
    expect(media.mediaType.toLowerCase()).toBe('image');
  });
});
