import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function choose(page: Page, id: string, option: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: option, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

test("filters survive reload and have a useful empty state", async ({
  page,
}) => {
  await page.goto("/cases");
  await expect(page.locator(".case-card")).toHaveCount(4);
  await choose(page, "filter-city", "Suzano");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.locator(".case-card")).toContainText("Marcos Oliveira");
  await page.reload();
  await expect(page.locator("#filter-city")).toContainText("Suzano");
  await page.getByLabel("Nome ou cidade").fill("Nome inexistente");
  await expect(page.getByText("Nenhum aviso por aqui.")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator(".case-card")).toHaveCount(4);
});

test("publish, inspect public snapshot, withdraw, and remove from network", async ({
  page,
}) => {
  await page.goto("/organization");
  await expect(
    page.getByRole("button", { name: "Aprovar publicação" }),
  ).toBeDisabled();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Origem e campos fictícios conferidos para o piloto.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Aprovar publicação" }).click();
  await expect(page.getByRole("status")).toContainText("Publicação aprovada");
  await page.getByRole("link", { name: "Ver página pública" }).click();
  await expect(
    page.getByRole("heading", { name: "Beatriz Santos", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    "Origem e campos fictícios conferidos para o piloto.",
  );
  await page.getByRole("link", { name: "Área da organização" }).click();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Retirada solicitada nesta demonstração.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Retirar divulgação" }).click();
  await expect(
    page.getByText("A divulgação foi retirada.", { exact: true }),
  ).toBeVisible();
  await page
    .locator("header nav")
    .getByRole("link", { name: "Encontrar avisos" })
    .click();
  await expect(page.locator(".case-card")).toHaveCount(4);
  await expect(page.locator(".case-card")).not.toContainText([
    "Beatriz Santos",
  ]);
  await page
    .locator("header nav")
    .getByRole("link", { name: "Rede de cuidado" })
    .click();
  await choose(page, "network-city", "Suzano");
  await expect(page.locator(".partner-widget")).toContainText(
    "Marcos Oliveira",
  );
  await expect(page.getByRole("button", { name: "Próximo aviso" })).toHaveCount(
    0,
  );
});

test("contact dialog is explicit, supports Escape, and returns focus", async ({
  page,
}) => {
  await page.goto("/cases/ana-lucia");
  const trigger = page.getByRole("button", { name: "Tenho uma informação" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "nenhum relato é recebido",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goto("/cases/not-found");
  await expect(
    page.getByRole("heading", { name: "Este aviso não está disponível." }),
  ).toBeVisible();
});

for (const width of [390, 1440]) {
  test(`responsive pages and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of [
      "/",
      "/cases",
      "/cases/ana-lucia",
      "/network",
      "/guidance",
      "/organization",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.waitForTimeout(150);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        path,
      ).toBeTruthy();
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        path,
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("mobile Mavis navigation sheet closes after following a link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Encontre seu caminho" });
  await expect(menu).toBeVisible();
  await menu
    .getByRole("link", { name: "Encontrar avisos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cases$/);
  await expect(menu).not.toBeVisible();
  await expect(page.locator(".case-card")).toHaveCount(4);
});

test("Mavis review cards support keyboard activation and evidence expands accessibly", async ({
  page,
}) => {
  await page.goto("/organization");
  const record = page.getByRole("button", { name: /Marcos Oliveira/ });
  await record.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".review-editor h2")).toHaveText("Marcos Oliveira");
  const expand = page.getByRole("button", { name: "Simular apoio da IA" });
  await expand.click();
  await expect(expand).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#ai-evidence")).toContainText("Sugestão simulada");
  await expand.click();
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#ai-evidence")).toBeHidden();
});

test("reduced motion keeps the full experience usable with no running animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.getByRole("button", { name: "Suzano", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Suzano", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
    ),
  ).toBe(0);
  await page.getByRole("link", { name: "Ver avisos em Suzano" }).click();
  await expect(page.locator("#filter-city")).toContainText("Suzano");
  await expect(page.locator(".case-card")).toHaveCount(1);
});

test("home regional selector remains usable on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const city = page.locator("#home-city");
  await city.scrollIntoViewIfNeeded();
  expect((await city.boundingBox())?.width).toBeGreaterThan(120);
  await choose(page, "home-city", "Guarulhos");
  await page.getByRole("button", { name: "Explorar região" }).click();
  await expect(page.locator("#filter-city")).toContainText("Guarulhos");
  await expect(page.locator(".case-card")).toHaveCount(1);
});

test("Mavis motion survives city changes, resizing, reduced motion and navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const beacon = page.locator(".beacon-glass");
  await expect(beacon).toBeVisible();
  const initial = await beacon.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const scene = await page.locator(".network-scene").boundingBox();
  if (!scene) throw new Error("Network scene must be visible");
  await page.mouse.move(
    scene.x + scene.width * 0.8,
    scene.y + scene.height * 0.6,
  );
  await expect
    .poll(() =>
      beacon.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initial);
  for (const city of ["Suzano", "Guarulhos", "São Paulo"]) {
    await page.getByRole("button", { name: city, exact: true }).click();
    await expect(
      page.getByRole("button", { name: city, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(beacon).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page.getByRole("link", { name: "Ver avisos em São Paulo" }).click();
  await expect(page.locator("#filter-city")).toContainText("São Paulo");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Lume, início" })
    .click();
  await expect(beacon).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  expect(errors).toEqual([]);
});

test("Mavis choice sheets support keyboard cancellation and segmented preview", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/network");
  const city = page.locator("#network-city");
  await expect(city).toBeEnabled();
  await city.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(city).toContainText("Guarulhos");
  await expect(city).toBeFocused();
  await city.click();
  await page.keyboard.press("Home");
  await page.keyboard.press("Escape");
  await expect(city).toContainText("Guarulhos");
  await expect(city).toBeFocused();
  await page.getByRole("radio", { name: "Tela", exact: true }).check();
  await expect(page.locator(".widget-stage")).toHaveClass(/screen-mode/);
  await page.getByRole("radio", { name: "Site / widget", exact: true }).check();
  await expect(page.locator(".widget-stage")).not.toHaveClass(/screen-mode/);
  expect(errors).toEqual([]);
});

test("public search retains its context through details and supports individual filter removal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/cases");
  await choose(page, "filter-city", "São Paulo");
  await choose(page, "filter-age", "60 anos ou mais");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(
    page.getByText("1 aviso disponível", { exact: true }),
  ).toBeVisible();
  await choose(page, "case-order", "Desaparecimentos mais recentes");
  await page
    .getByRole("button", { name: "Remover filtro de faixa etária" })
    .click();
  await expect(page.locator("#filter-age")).toBeFocused();
  await expect(page.locator(".case-card")).toHaveCount(2);
  await expect(page.locator(".case-card h3")).toHaveText([
    "Pedro Almeida",
    "Ana Lúcia Ferreira",
  ]);
  await page.locator(".case-link").filter({ hasText: "Pedro Almeida" }).click();
  await expect(
    page.getByRole("heading", { name: "Pedro Almeida", exact: true, level: 1 }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Voltar para minha busca" }).click();
  await expect(page.locator("#filter-city")).toContainText("São Paulo");
  await expect(page.locator("#case-order")).toContainText(
    "Desaparecimentos mais recentes",
  );
  await expect(page.locator(".case-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Remover filtro de cidade" }).click();
  await expect(page.locator("#filter-city")).toBeFocused();
  await expect(page.locator(".case-card")).toHaveCount(4);
  await expect(page.getByRole("group", { name: "Filtros ativos" })).toHaveCount(
    0,
  );
  await choose(page, "case-order", "Nome (A–Z)");
  await expect(page.locator(".case-card h3")).toHaveText([
    "Ana Lúcia Ferreira",
    "Helena Costa",
    "Marcos Oliveira",
    "Pedro Almeida",
  ]);
  await page.reload();
  await expect(page.locator("#case-order")).toContainText("Nome (A–Z)");
  expect(errors).toEqual([]);
});

test("sharing copies an explicitly fictional public notice without search parameters", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Permissões de leitura/escrita do clipboard automatizadas somente no Chromium; fallback coberto nos três motores.",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "/cases/ana-lucia?search=texto-pessoal&city=São%20Paulo&sort=name&return=https://example.com",
  );
  const trigger = page.getByRole("button", { name: "Compartilhar aviso" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Compartilhar com cuidado" });
  await expect(sheet).toBeVisible();
  const url = new URL("/cases/ana-lucia", page.url()).href;
  await expect(sheet.getByLabel("Link da demonstração")).toHaveValue(url);
  const summary = await sheet.getByLabel("Texto de demonstração").inputValue();
  expect(summary).toContain("pessoa e aviso fictícios. Não é uma busca real.");
  expect(summary).toContain("Ana Lúcia Ferreira");
  expect(summary).not.toContain("texto-pessoal");
  expect(summary).not.toContain("example.com");
  await sheet
    .getByRole("button", { name: "Copiar texto", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(summary);
  await sheet.getByRole("button", { name: "Copiar link", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(url);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("mobile sharing stays accessible when clipboard permission is denied", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/cases/ana-lucia");
  await page.getByRole("button", { name: "Compartilhar aviso" }).click();
  const sheet = page.getByRole("dialog", { name: "Compartilhar com cuidado" });
  await sheet.getByRole("button", { name: "Copiar link", exact: true }).click();
  await expect(sheet.getByRole("status")).toContainText(
    "Selecione o conteúdo e copie manualmente",
  );
  await expect(sheet.getByLabel("Link da demonstração")).toHaveAttribute(
    "readonly",
    "",
  );
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await sheet.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(sheet).not.toBeVisible();
});
