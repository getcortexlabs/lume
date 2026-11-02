import { chromium } from "@playwright/test";

// Run against a production build. Decoded resource bytes exclude HTML and HTTP compression.
const base = process.env.LUME_TEST_URL ?? "http://127.0.0.1:5191";
const browser = await chromium.launch();
try {
  const results = [];
  for (const route of ["/", "/cases", "/organization"]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    await page.goto(base + route);
    await page.waitForTimeout(1200); // Match the baseline's observation window, including font loading.
    results.push({
      route,
      ...(await page.evaluate(() => {
        const resources = performance
          .getEntriesByType("resource")
          .map((r) => ({
            path: new URL(r.name).pathname,
            bytes: r.decodedBodySize,
          }));
        const bytesFor = (pattern) =>
          resources
            .filter((r) => pattern.test(r.path))
            .reduce((total, r) => total + r.bytes, 0);
        return {
          resourceCount: resources.length,
          resourceBytes: resources.reduce((total, r) => total + r.bytes, 0),
          javascriptBytes: bytesFor(/\.js$/),
          cssBytes: bytesFor(/\.css$/),
          imageBytes: bytesFor(/\.(png|webp|svg)$/),
          fontBytes: bytesFor(/\.woff2?$/),
          largest: [...resources].sort((a, b) => b.bytes - a.bytes).slice(0, 5),
        };
      })),
    });
    await page.close();
  }
  console.log(
    JSON.stringify(
      {
        viewport: "390x844",
        deviceScaleFactor: 1,
        observationMs: 1200,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
