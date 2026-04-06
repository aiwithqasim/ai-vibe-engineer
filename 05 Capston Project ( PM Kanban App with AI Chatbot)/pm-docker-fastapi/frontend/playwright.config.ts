import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

const e2eDb = join(tmpdir(), "kanban-e2e.sqlite");
const uvicornBoard =
  process.platform === "win32"
    ? `cd .. && set "DATABASE_PATH=${e2eDb}" && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`
    : `cd .. && export DATABASE_PATH='${e2eDb.replace(/'/g, "'\\''")}' && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: uvicornBoard,
      url: "http://127.0.0.1:8000/api/hello",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
