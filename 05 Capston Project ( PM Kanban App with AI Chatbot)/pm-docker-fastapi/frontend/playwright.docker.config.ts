import { defineConfig, devices } from "@playwright/test";

/**
 * E2e against a single origin (e.g. Docker on port 8000).
 * Start the stack first: scripts/start.bat or scripts/start.sh
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
