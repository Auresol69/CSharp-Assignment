import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
  },

  projects: [
    // ── 1. Auth setup (chạy trước tất cả) ───────────────────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── 2. Post + Story → dùng user thường ──────────────────────────────────
    {
      name: 'post-story',
      testMatch: /\/(post|story)\.spec\.ts$/,
      use: {
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ── 3. Report → cần cả user token (gửi report) + admin token (verify) ───
    //    Cả 2 token đều được load thủ công trong test nên dùng user context
    {
      name: 'report',
      testMatch: /\/(report|report-notification-branch)\.spec\.ts$/,
      use: {
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'core-regression',
      testMatch: /\/(profile|friends|comments|notifications|hashtags|moderation)\.spec\.ts$/,
      use: {
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
