import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.LUME_TEST_URL ?? "http://127.0.0.1:5190",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.LUME_TEST_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:5190",
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  workers: 4,
});
