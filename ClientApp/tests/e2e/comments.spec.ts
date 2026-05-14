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

test('TC-CM-01: create comment and fetch comments by post', async ({ request }) => {
  const t = token();
  const content = `[pw] comment post ${Date.now()}`;

  const createPost = await request.post(`${API_BASE}/Post`, {
    headers: { Authorization: `Bearer ${t}` },
    multipart: { Content: content },
  });
  expect(createPost.status()).toBe(201);
  const post = await createPost.json();
  const postId = post.idPost as string;

  try {
    const createComment = await request.post(`${API_BASE}/Comments`, {
      headers: { Authorization: `Bearer ${t}` },
      data: { idPost: postId, content: '[pw] root comment' },
    });
    expect(createComment.status()).toBe(201);

    const list = await request.get(`${API_BASE}/Comments/post/${postId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    expect(list.ok()).toBeTruthy();
    const body = await list.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  } finally {
    await request.delete(`${API_BASE}/Post/${postId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
  }
});
