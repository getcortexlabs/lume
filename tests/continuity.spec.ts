import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("autosave survives reload and a second page without duplicating the draft", async ({
  page,
  context,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Rascunho Persistente");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/draft=draft-[a-f0-9-]+/);
  await page.reload();
  await expect(page.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Rascunho Persistente",
  );
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Alteração antes de sair");
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  const other = await context.newPage();
  await other.goto("/organization/drafts");
  await expect(
    other.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(1);
  await other.getByRole("link", { name: "Retomar cadastro" }).click();
  await expect(other.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Alteração antes de sair",
  );
});

test("storage failure is visible and can recover without losing typed content", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as any).restoreDraftStorage = () => {
      Storage.prototype.setItem = original;
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Ainda não salvo");
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível salvar neste navegador",
  );
  await expect(page.getByText("Alterações ainda não salvas.")).toBeVisible();
  await page.evaluate(() => (window as any).restoreDraftStorage());
  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page).toHaveURL(/\/drafts\/draft-[a-f0-9-]+/);
  await page.reload();
  await expect(page.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Ainda não salvo",
  );
});

test("version comparison shows the actual publication change and responsible reviewer", async ({
  page,
}) => {
  await page.goto("/organization?case=beatriz-santos");
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Conferência para comparação.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Aprovar publicação" }).click();
  const history = page.locator(".version-history");
  await expect(history).toContainText("Versão atual 2");
  await expect(history).toContainText("Revisor Lume · demonstração");
  await expect(history).toContainText("Motivo: Conferência para comparação.");
  const difference = history
    .locator('[data-changed="true"]')
    .filter({ hasText: "Situação da publicação" });
  await expect(difference).toContainText("Antes · Em revisão");
  await expect(difference).toContainText("Agora · Publicado");
});

test("poster uses only the public projection, an actual QR and a print layout", async ({
  page,
}) => {
  await page.goto("/cases/ana-lucia?search=private-search");
  await page.getByRole("link", { name: "Preparar cartaz" }).click();
  await expect(page).toHaveURL(/\/cases\/ana-lucia\/poster$/);
  const poster = page.getByRole("article", { name: "Cartaz de demonstração" });
  await expect(poster).toContainText("NÃO É UMA BUSCA REAL");
  await expect(poster).not.toContainText("REGISTRO FICTÍCIO");
  const url = new URL("/cases/ana-lucia", page.url()).href;
  await expect(poster.getByRole("link")).toHaveAttribute("href", url);
  await expect(poster.locator("svg.poster-qr path")).toHaveAttribute("d", /^M/);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".poster-controls")).not.toBeVisible();
  await expect(page.locator(".site-header")).not.toBeVisible();
  await expect(poster).toBeVisible();
});

test("withdrawn notices cannot produce a poster in the active demo session", async ({
  page,
}) => {
  await page.goto("/cases/ana-lucia/poster");
  await page
    .getByRole("link", { name: "Área da organização", exact: true })
    .click();
  await page.getByRole("button", { name: /Ana Lúcia Ferreira/ }).click();
  await page.getByLabel("Justificativa da decisão").fill("Retirada do cartaz.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Retirar divulgação" }).click();
  await expect(
    page.getByText("A divulgação foi retirada.", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.locator("h1")).toHaveText(
    "A divulgação deste aviso foi retirada.",
  );
  await expect(page.locator(".case-poster")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Imprimir ou salvar PDF" }),
  ).toHaveCount(0);
});

test("follow-up removes a resolved source task and opens the correct delivery channel", async ({
  page,
}) => {
  await page.goto("/organization/tasks");
  const source = page
    .locator(".follow-up-card")
    .filter({ hasText: "Boletim regional" });
  await source
    .getByRole("button", { name: "Simular atualização da fonte" })
    .click();
  await expect(source).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Nenhuma fonte externa");
  await page
    .locator(".follow-up-card")
    .filter({ hasText: "Mercado Horizonte" })
    .getByRole("link", { name: "Inspecionar canal" })
    .click();
  await expect(page).toHaveURL(/partner=market/);
  await expect(page.locator("#partner-connection")).toContainText(
    "Falha de atualização",
  );
});

test("a slow failing request cannot paint an error over the next route", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/organization/simulation");
  await page.locator("#simulation-latency").click();
  await page.getByRole("option", { name: "3 segundos", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Simular serviço indisponível" })
    .check();
  await page.getByRole("button", { name: "Aplicar cenário" }).click();
  await page.getByRole("link", { name: "Experimentar busca pública" }).click();
  await expect(page).toHaveURL(/\/cases$/);
  await page
    .locator("header nav")
    .getByRole("link", { name: "Preciso de orientação" })
    .click();
  await expect(page).toHaveURL(/\/guidance$/);
  await page.waitForTimeout(3200); // deliberately outlive the pending mock request
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const width of [390, 1440])
  test(`poster and follow-up accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/organization/tasks", "/cases/ana-lucia/poster"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        path,
      ).toBe(true);
    }
  });

test("keyboard can reach the draft fields and submit an explicit save", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  const input = page.getByLabel("Nome fictício", { exact: true });
  await input.focus();
  await page.keyboard.type("Cadastro pelo teclado");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Idade", { exact: true })).toBeFocused();
  await page.keyboard.type("45");
  const save = page.getByRole("button", { name: "Salvar rascunho" });
  await save.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/drafts\/draft-[a-f0-9-]+/);
});
