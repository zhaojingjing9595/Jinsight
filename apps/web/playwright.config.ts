import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "path";

// Load workspace-level .env so E2E_TEST_EMAIL and E2E_TEST_PASSWORD are available
config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
