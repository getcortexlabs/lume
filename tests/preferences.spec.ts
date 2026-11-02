import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function choose(page: Page, id: string, label: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test("preferred region persists without replacing an explicit search", async ({
  page,
  context,
}) => {
  await page.goto("/preferences");
  await choose(page, "preferred-region", "Suzano");
  await page.reload();
  await expect(page.locator("#preferred-region")).toContainText("Suzano");
  await page.goto("/");
  await expect(page.locator("#home-city")).toContainText("Suzano");
  await page.goto("/cases?city=Guarulhos");
  await expect(page.locator("#filter-city")).toContainText("Guarulhos");
  await page.getByRole("button", { name: "Minha região: Suzano" }).click();
  await expect(page).toHaveURL(/city=Suzano/);
  const other = await context.newPage();
  await other.goto("/preferences");
  await choose(other, "preferred-region", "São Paulo");
  await expect(
    page.getByRole("button", { name: "Minha região: São Paulo" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/city=Suzano/);
});

test("saved searches keep only public filters and can be reopened and removed", async ({
  page,
}) => {
  await page.goto("/cases?city=Suzano&sort=name&page=2&private=discard");
  await page.getByRole("button", { name: "Salvar esta busca" }).click();
  await page.getByLabel("Nome da busca").fill("Minha região favorita");
  await page.getByRole("button", { name: "Salvar busca", exact: true }).click();
  const saved = page.getByRole("link", {
    name: "Minha região favorita",
    exact: true,
  });
  await expect(saved).toBeVisible();
  const query = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("lume:preferences:v1")!).searches[0]
        .query,
  );
  expect(query).toEqual({ city: "Suzano", sort: "name" });
  await page.reload();
  await expect(saved).toBeVisible();
  await saved.click();
  await expect(page).toHaveURL(/\/cases\?city=Suzano&sort=name$/);
  await page.getByRole("button", { name: "Salvar esta busca" }).click();
  await page.getByRole("button", { name: "Salvar busca", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("já está salva");
  await page
    .getByRole("button", { name: "Excluir busca Minha região favorita" })
    .click();
  await page.reload();
  await expect(saved).toHaveCount(0);
});

test("reading preferences persist, stop motion, and remain accessible on mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/preferences");
  await choose(page, "preferred-text-size", "Texto maior");
  await choose(page, "preferred-contrast", "Contraste reforçado");
  await choose(page, "preferred-motion", "Reduzir animações");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "large");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  for (const path of ["/preferences", "/", "/cases?city=Suzano"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
      )
      .toBe(0);
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
  await page.goto("/preferences");
  await page
    .getByRole("button", { name: "Restaurar leitura e movimento" })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "false",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-text-size",
    "standard",
  );
  expect(errors).toEqual([]);
});

test("device motion preference remains effective and pauses display rotation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/preferences");
  await expect(
    page.getByText("Seu dispositivo pede movimento reduzido.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Restaurar leitura e movimento" })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await page.goto("/screen");
  await expect(
    page.getByRole("button", { name: "Iniciar rotação" }),
  ).toBeVisible();
});

test("corrupt and blocked storage preserve a usable session and show honest feedback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("lume:preferences:v1", "invalid-json"),
  );
  await page.goto("/preferences");
  await expect(page.getByRole("status")).toContainText("Não foi possível ler");
  expect(
    await page.evaluate(() => localStorage.getItem("lume:preferences:v1")),
  ).toBe("invalid-json");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await choose(page, "preferred-text-size", "Texto maior");
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "large");
  await expect(page.getByRole("status")).toContainText("Aplicado nesta sessão");
});

test("global error recovery supports retry and home without losing saved drafts", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Rascunho antes do erro");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  const draftUrl = page.url();
  await page.goto("/organization/simulation");
  await page.getByRole("button", { name: "Testar página de erro" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Não foi possível abrir esta página.",
  );
  await expect(page.locator("body")).not.toContainText(
    "Simulated application failure",
  );
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByRole("button", { name: "Testar página de erro" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Testar página de erro" }).click();
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Toda busca",
  );
  await page.goto(draftUrl);
  await expect(page.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Rascunho antes do erro",
  );
});
