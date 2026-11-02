import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(({ page }) => expect(browserErrors.get(page)).toEqual([]));

async function choose(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
async function confirmClear(page: Page, action: string) {
  await page.getByRole("button", { name: action, exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirmar limpeza de dados" })
    .getByRole("button", { name: "Confirmar limpeza" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

test("sign-out flushes a draft, gates direct organization URLs and returns to the requested page", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Rascunho ao sair");
  await page.getByRole("button", { name: "Sair da demonstração" }).click();
  await expect(page).toHaveURL(/\/sign-in\?/);
  await page.goto("/organization/drafts");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=/);
  await page.reload();
  await page.getByRole("button", { name: "Entrar na demonstração" }).click();
  await expect(page).toHaveURL(/\/organization\/drafts$/);
  await expect(
    page.getByRole("heading", { name: "Rascunho ao sair" }),
  ).toBeVisible();
});

test("expired and denied sessions recover while public pages remain available", async ({
  page,
}) => {
  for (const [action, route, recovery] of [
    [
      "Simular sessão expirada",
      "session-expired",
      "Retomar sessão de demonstração",
    ],
    ["Simular acesso negado", "access-denied", "Usar perfil de revisor"],
  ]) {
    await page.goto("/organization/simulation");
    await page.getByRole("button", { name: action }).click();
    await expect(page).toHaveURL(new RegExp(`/${route}\\?`));
    await page.goto("/cases");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Olhar com atenção",
    );
    await page.goto("/organization?case=beatriz-santos&status=in_review");
    await expect(page).toHaveURL(new RegExp(`/${route}\\?`));
    await page.getByRole("button", { name: recovery }).click();
    await expect(page).toHaveURL(
      /\/organization\?case=beatriz-santos&status=in_review$/,
    );
  }
});

test("session return destinations reject external URLs and invalid storage recovers", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("lume:demo-session:v1", "invalid"),
  );
  await page.goto("/sign-in?returnTo=https%3A%2F%2Fexample.com");
  await expect(page.getByRole("status")).toContainText(
    "Não foi possível recuperar",
  );
  await page.getByRole("button", { name: "Entrar na demonstração" }).click();
  await expect(page).toHaveURL(/\/organization$/);
});

test("clearing preferences and searches is selective, cancelable and synchronized across tabs", async ({
  page,
  context,
}) => {
  await page.goto("/cases?city=Suzano");
  await page.getByRole("button", { name: "Salvar esta busca" }).click();
  await page.getByRole("button", { name: "Salvar busca", exact: true }).click();
  await page.goto("/preferences");
  await choose(page, "preferred-region", "Guarulhos");
  const other = await context.newPage();
  await other.goto("/preferences");
  await page.getByRole("button", { name: "Excluir buscas salvas" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByText("1 busca(s) neste navegador.", { exact: true }),
  ).toBeVisible();
  await confirmClear(page, "Limpar preferências");
  await expect(other.locator("#preferred-region")).toContainText(
    "Todas as cidades",
  );
  await expect(
    page.getByText("1 busca(s) neste navegador.", { exact: true }),
  ).toBeVisible();
  await choose(page, "preferred-region", "Suzano");
  await confirmClear(page, "Excluir buscas salvas");
  await expect(
    other.getByText("0 busca(s) neste navegador.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("#preferred-region")).toContainText("Suzano");
});

test("draft cleanup preserves another organization and does not reset publication decisions", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Horizonte para limpar");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  const oldDraftUrl = page.url();
  await page.getByRole("link", { name: "Trocar organização" }).click();
  await page.getByRole("button", { name: "Usar Instituto Aurora" }).click();
  // Internal navigation keeps the active workspace.
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("link", { name: "Cadastrar aviso fictício" }).click();
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Aurora preservado");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Trocar organização" }).click();
  await page
    .getByRole("button", { name: "Usar Organização Horizonte" })
    .click();
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("button", { name: /Beatriz Santos/ }).click();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Publicação fictícia preservada após limpeza.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Aprovar publicação" }).click();
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Preferências e acessibilidade" })
    .click();
  await confirmClear(page, "Excluir rascunhos desta organização");
  const data = await page.evaluate(() => ({
    horizonte: JSON.parse(localStorage.getItem("lume:demo-drafts:v1")!),
    aurora: JSON.parse(localStorage.getItem("lume:demo-drafts:v1:aurora")!),
  }));
  expect(data.horizonte).toEqual([]);
  expect(data.aurora[0].input.name).toBe("Aurora preservado");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Área da organização" })
    .click();
  await page.getByRole("button", { name: /Beatriz Santos/ }).click();
  await expect(
    page.getByRole("button", { name: "Retirar divulgação" }),
  ).toBeVisible();
  await page.goto(oldDraftUrl);
  await expect(page.getByRole("alert")).toContainText("não está disponível");
});

test("blocked storage cannot claim that local data was deleted", async ({
  page,
}) => {
  await page.goto("/preferences");
  await choose(page, "preferred-region", "Suzano");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.getByRole("button", { name: "Limpar preferências" }).click();
  await page.getByRole("button", { name: "Confirmar limpeza" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Nenhuma exclusão foi confirmada",
  );
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator("#preferred-region")).toContainText("Suzano");
});

test("session screens and data controls remain accessible on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/sign-in",
    "/session-expired",
    "/access-denied",
    "/preferences",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
});

test("brand assets use responsive sources without downloading the original PNG", async ({
  page,
}) => {
  const images: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image") images.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("banner").getByAltText("Lume")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".brand-image img")
        .first()
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true);
  expect(images.some((url) => url.endsWith("lume-original.png"))).toBe(false);
  expect(images.some((url) => /lume-(480|960|original)\.webp$/.test(url))).toBe(
    true,
  );
});
