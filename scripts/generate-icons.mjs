import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Render the existing vector mark; do not crop or redraw the source logo.
const svg = await readFile(
  new URL("../public/favicon.svg", import.meta.url),
  "utf8",
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  async function render(size) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<style>html,body{margin:0;width:100%;height:100%;background:#c5ed70}svg{display:block;width:100%;height:100%}</style>${svg}`,
    );
    return page.screenshot({ type: "png" });
  }
  await writeFile(
    new URL("../public/apple-touch-icon.png", import.meta.url),
    await render(180),
  );
  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes) images.push(await render(size));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  for (const [index, size] of sizes.entries()) {
    const entry = 6 + index * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[index].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[index].length;
  }
  await writeFile(
    new URL("../public/favicon.ico", import.meta.url),
    Buffer.concat([header, ...images]),
  );
  console.log(
    "Generated the 180px touch icon and 16/32/48px ICO from favicon.svg.",
  );
} finally {
  await browser.close();
}
