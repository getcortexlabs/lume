import { test, expect } from "@playwright/test";

test("public content is useful without JavaScript and carries only public snapshots", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/cases?city=Suzano");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.locator(".case-card")).toContainText("Marcos Oliveira");
  const payload = await page.locator("script#__NUXT_DATA__").textContent();
  expect(payload).toContain("cases:page:");
  for (const privateField of [
    '"evidence"',
    '"history"',
    '"versions"',
    '"suggestions"',
    '"authorized"',
    "REGISTRO FICTÍCIO",
    "Beatriz Santos",
    "testemunha@example.com",
    '"lastError"',
    '"recipient"',
  ])
    expect(payload).not.toContain(privateField);
  await page.goto("/cases/ana-lucia");
  await expect(page.locator("h1")).toHaveText("Ana Lúcia Ferreira");
  await expect(
    page.getByText("Informações do aviso", { exact: true }),
  ).toBeVisible();
  expect((await page.goto("/cases/not-found"))?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(
    "Este aviso não está disponível.",
  );
  expect((await page.goto("/unknown-route"))?.status()).toBe(404);
  await context.close();
});

test("server responses isolate concurrent filters and exclude review payloads", async ({
  request,
}) => {
  const responses = await Promise.all(
    ["Suzano", "São Paulo", "Guarulhos", "Suzano"].map((city) =>
      request.get(`/cases?city=${encodeURIComponent(city)}`),
    ),
  );
  const html = await Promise.all(responses.map((response) => response.text()));
  expect(html[0]).toContain("Marcos Oliveira");
  expect(html[0]).not.toContain("Ana Lúcia Ferreira");
  expect(html[1]).toContain("Ana Lúcia Ferreira");
  expect(html[1]).not.toContain("Marcos Oliveira");
  expect(html[2]).toContain("Helena Costa");
  expect(html[2]).not.toContain("Pedro Almeida");
  expect(html[3]).toContain("Marcos Oliveira");
  const admin = await request.get("/organization");
  expect(admin.headers()["cache-control"]).toContain("no-store");
  const adminHtml = await admin.text();
  expect(adminHtml).not.toContain("REGISTRO FICTÍCIO");
  expect(adminHtml).not.toContain("Beatriz Santos");
});

test("editing before hydration keeps the input and updates the public search", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration|mismatch/i.test(message.text())) errors.push(message.text());
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_nuxt\/.*\.js(?:\?.*)?$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/cases", { waitUntil: "commit" });
  const input = page.getByLabel("Nome ou cidade", { exact: true });
  await expect(input).toBeVisible();
  await input.evaluate((element) => {
    (element as HTMLInputElement & { lumeMarker?: string }).lumeMarker =
      "original";
  });
  await input.fill("Helena");
  release();
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.locator(".case-card")).toContainText("Helena Costa");
  expect(
    await input.evaluate(
      (element) =>
        (element as HTMLInputElement & { lumeMarker?: string }).lumeMarker,
    ),
  ).toBe("original");
  await expect(input).toHaveValue("Helena");
  expect(errors).toEqual([]);
});

test("date edits before hydration survive together without replacing the input nodes", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_nuxt\/.*\.js(?:\?.*)?$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/cases", { waitUntil: "commit" });
  await page.getByLabel("A partir de", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Até", { exact: true }).fill("2026-10-29");
  release();
  await expect(page.locator(".case-card")).toHaveCount(2);
  await expect(page.getByLabel("A partir de", { exact: true })).toHaveValue(
    "2026-10-28",
  );
  await expect(page.getByLabel("Até", { exact: true })).toHaveValue(
    "2026-10-29",
  );
  await expect(page).toHaveURL(/from=2026-10-28/);
  await expect(page).toHaveURL(/to=2026-10-29/);
});
