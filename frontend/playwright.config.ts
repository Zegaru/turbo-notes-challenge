import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 15_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      retries: 0,
    },
    {
      name: "e2e-authenticated",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /app\.spec\.ts/,
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "e2e-login-flow",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ["setup"],
      testMatch: /login-flow\.spec\.ts/,
    },
  ],
});
