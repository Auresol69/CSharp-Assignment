/**
 * report.spec.ts
 *
 * Test case: Report bài → verify ghi vào DB
 *
 * Luồng:
 *  1. User thường tạo một bài post (dùng token từ storageState).
 *  2. User gọi POST /api/post/{id}/report với reason.
 *  3. Assert HTTP 200 + message "Đã gửi báo cáo."
 *  4. Admin gọi GET /api/admin/moderation/posts/{id}/reports để
 *     verify report thực sự đã được ghi vào DB (không chỉ dựa vào response).
 *  5. Cleanup: Admin xóa report + xóa bài test.
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://127.0.0.1:5153/api';

function getTokenFromStorageState(statePath: string): string {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  const authRaw = state.origins[0]?.localStorage?.find(
    (e: { name: string }) => e.name === 'auth'
  )?.value;
  if (!authRaw) throw new Error(`No auth token in ${statePath}`);
  return JSON.parse(authRaw).accessToken as string;
}

const USER_STATE = path.join(__dirname, '.auth/user.json');
const ADMIN_STATE = path.join(__dirname, '.auth/admin.json');

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Report bài viết', () => {
  let postId: string | null = null;

  // Tạo bài test trước mỗi test case (text-only, không cần upload ảnh)
  test.beforeEach(async ({ request }) => {
    const userToken = getTokenFromStorageState(USER_STATE);
    const res = await request.post(`${API_BASE}/post`, {
      headers: { Authorization: `Bearer ${userToken}` },
      multipart: { Content: `[playwright] report target post ${Date.now()}` },
    });
    expect(res.ok(), `Không thể tạo post để test report: ${await res.text()}`).toBeTruthy();
    const body = await res.json();
    postId = body.idPost as string;
  });

  // Cleanup: Admin xóa report + post sau mỗi test
  test.afterEach(async ({ request }) => {
    if (!postId) return;
    const adminToken = getTokenFromStorageState(ADMIN_STATE);

    // Xóa reports trước (nếu có)
    await request.delete(`${API_BASE}/admin/moderation/posts/${postId}/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Xóa bài post
    const userToken = getTokenFromStorageState(USER_STATE);
    await request.delete(`${API_BASE}/post/${postId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    postId = null;
  });

  // ── TC-05: Report bài → API trả 200 + ghi vào DB ────────────────────────────
  test('TC-05: report bài → API 200 → DB có record (xác minh qua Admin API)', async ({
    request,
  }) => {
    const userToken = getTokenFromStorageState(USER_STATE);
    const adminToken = getTokenFromStorageState(ADMIN_STATE);
    const reason = 'Nội dung không phù hợp - test playwright';

    // 1. User gửi report
    const reportRes = await request.post(`${API_BASE}/post/${postId}/report`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      data: { reason },
    });

    expect(
      reportRes.status(),
      `Report failed (${reportRes.status()}): ${await reportRes.text()}`
    ).toBe(200);

    const reportBody = await reportRes.json();
    expect(reportBody.message).toContain('báo cáo');

    // 2. Admin verify report đã vào DB
    const verifyRes = await request.get(
      `${API_BASE}/admin/moderation/posts/${postId}/reports`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(verifyRes.ok(), `Admin verify failed: ${await verifyRes.text()}`).toBeTruthy();

    const reports: Array<{
      reportId: string;
      postId: string;
      reason: string;
    }> = await verifyRes.json();

    expect(reports.length, 'Không tìm thấy report nào trong DB').toBeGreaterThanOrEqual(1);

    const myReport = reports.find((r) => r.reason === reason);
    expect(myReport, `Report với reason "${reason}" không tìm thấy trong DB`).toBeDefined();
    expect(myReport!.postId).toBe(postId);

    console.log(`✓ Report đã được ghi vào DB: reportId=${myReport!.reportId}`);
  });

  // ── TC-06: Report bài với reason rỗng vẫn chấp nhận (optional field) ────────
  test('TC-06: report với reason rỗng → vẫn 200 và ghi DB', async ({ request }) => {
    const userToken = getTokenFromStorageState(USER_STATE);
    const adminToken = getTokenFromStorageState(ADMIN_STATE);

    // 1. Report không có reason
    const reportRes = await request.post(`${API_BASE}/post/${postId}/report`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      data: { reason: '' },
    });

    expect(reportRes.status()).toBe(200);

    // 2. Verify DB vẫn có record
    const verifyRes = await request.get(
      `${API_BASE}/admin/moderation/posts/${postId}/reports`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(verifyRes.ok()).toBeTruthy();

    const reports: unknown[] = await verifyRes.json();
    expect(reports.length).toBeGreaterThanOrEqual(1);
  });

  // ── TC-07: Report bài không tồn tại → 404 ───────────────────────────────────
  test('TC-07: report post không tồn tại → 404', async ({ request }) => {
    const userToken = getTokenFromStorageState(USER_STATE);
    const fakePostId = 'non-existent-post-id-99999';

    const reportRes = await request.post(`${API_BASE}/post/${fakePostId}/report`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      data: { reason: 'test 404' },
    });

    expect(reportRes.status()).toBe(404);
  });
});
