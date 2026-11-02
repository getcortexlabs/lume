import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function choose(page: Page, id: string, label: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
async function reviewDecision(page: Page, button: string) {
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Conferência fictícia desta demonstração.");
  await page
    .getByRole("checkbox", {
      name: "Conferi a origem e os campos desta publicação fictícia.",
    })
    .check();
  await page.getByRole("button", { name: button, exact: true }).click();
}

test("organization switching isolates drafts, cases and notifications and keeps the original workspace", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Rascunho exclusivo Horizonte");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Trocar organização" }).click();
  await page.getByRole("button", { name: "Usar Instituto Aurora" }).click();
  await expect(
    page.getByRole("button", { name: "Usar Instituto Aurora" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Clara Exemplo",
  );
  await expect(page.locator(".review-page")).not.toContainText(
    "Beatriz Santos",
  );
  await page.getByRole("link", { name: "Retomar rascunhos" }).click();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Trocar organização" }).click();
  await page
    .getByRole("button", { name: "Usar Organização Horizonte" })
    .click();
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("link", { name: "Retomar rascunhos" }).click();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(1);
  await expect(
    page.getByText("Rascunho exclusivo Horizonte", { exact: true }),
  ).toBeVisible();
});

test("notification actions retain read status and point to their review task", async ({
  page,
}) => {
  await page.goto("/organization/notifications");
  await expect(page.getByText("1 não lidas", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Abrir tarefa", exact: true }).click();
  await expect(page).toHaveURL(/case=beatriz-santos/);
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Beatriz Santos",
  );
  await page.getByRole("link", { name: "Notificações", exact: true }).click();
  await expect(page.getByText("0 não lidas", { exact: true })).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Mostrar apenas não lidas" })
    .check();
  await expect(
    page.getByRole("link", { name: "Abrir tarefa", exact: true }),
  ).toHaveCount(0);
});

test("review keeps the queue query, keyboard navigation ignores fields, and evidence highlights exact text", async ({
  page,
}) => {
  await page.goto("/organization?status=in_review&case=beatriz-santos");
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Beatriz Santos",
  );
  await page.getByRole("button", { name: "Destacar na fonte" }).click();
  await expect(page.locator(".evidence-document mark")).toHaveText(
    "Município: Suzano",
  );
  await page.getByRole("button", { name: "Próximo registro" }).click();
  await expect(page).toHaveURL(/status=in_review&case=antonio-lima/);
  const reason = page.getByLabel("Justificativa da decisão");
  await reason.fill("Texto em edição");
  await reason.press("Alt+ArrowLeft");
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Antônio Lima",
  );
  await page.getByRole("button", { name: "Registro anterior" }).focus();
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Beatriz Santos",
  );
  await expect(page).toHaveURL(/status=in_review&case=beatriz-santos/);
  await page.reload();
  await expect(page.locator(".review-editor h2").first()).toHaveText(
    "Beatriz Santos",
  );
  await expect(page.locator(".review-navigation")).toContainText("1 de 2");
});

test("standalone display rotates, pauses, removes expired data offline and revalidates", async ({
  page,
}) => {
  await page.goto(
    "/screen?city=S%C3%A3o+Paulo&interval=8&organization=horizonte",
  );
  await expect(page.locator(".display-person")).toContainText(
    "Ana Lúcia Ferreira",
  );
  // Mock business time only: Jolt/WAAPI keep their real document clock.
  await page.clock.setFixedTime(new Date());
  await page.clock.setFixedTime(
    new Date((await page.evaluate(() => Date.now())) + 8500),
  );
  await expect(page.locator(".display-person")).toContainText("Pedro Almeida");
  await page.getByRole("button", { name: "Pausar rotação" }).click();
  await page.clock.setFixedTime(
    new Date((await page.evaluate(() => Date.now())) + 8500),
  );
  await expect(page.locator(".display-person")).toContainText("Pedro Almeida");
  await page.getByRole("button", { name: "Testar funcionamento" }).click();
  await page.getByRole("button", { name: "Simular offline" }).click();
  await page.clock.setFixedTime(
    new Date((await page.evaluate(() => Date.now())) + 65000),
  );
  await expect(page.locator(".display-person")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Nenhum aviso em exibição" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reconectar demonstração" }).click();
  await expect(page.locator(".display-person")).toContainText(
    "Ana Lúcia Ferreira",
  );
});

test("revalidation preserves rotation through every notice", async ({
  page,
}) => {
  await page.goto("/screen?interval=8");
  await expect(page.locator(".display-person")).toContainText(
    "Ana Lúcia Ferreira",
  );
  // Mock business time only: Jolt/WAAPI keep their real document clock.
  await page.clock.setFixedTime(new Date());
  for (const name of [
    "Helena Costa",
    "Marcos Oliveira",
    "Pedro Almeida",
    "Ana Lúcia Ferreira",
  ]) {
    await page.clock.setFixedTime(
      new Date((await page.evaluate(() => Date.now())) + 8500),
    );
    await expect(page.locator(".display-person")).toContainText(name);
  }
});

test("widget configuration survives direct loading and reduced motion starts paused", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/organization/displays");
  await choose(page, "display-city", "São Paulo");
  await choose(page, "display-interval", "20 segundos");
  await page.getByRole("link", { name: "Abrir widget" }).click();
  await expect(page).toHaveURL(/\/embed\?.*interval=20/);
  await expect(page.locator(".display-person")).toContainText(
    "Ana Lúcia Ferreira",
  );
  await expect(
    page.getByRole("button", { name: "Iniciar rotação" }),
  ).toBeVisible();
  await page.goto("/embed?city=S%C3%A3o+Paulo&organization=aurora");
  await expect(page.locator(".display-person")).toContainText("Lia Exemplo");
  await expect(page.locator(".display-person")).not.toContainText("Ana Lúcia");
  await page.reload();
  await expect(page.locator(".display-person")).toContainText("Lia Exemplo");
});

test("guided demo tracks actual decisions and reset requires confirmation", async ({
  page,
}) => {
  await page.goto("/organization/guide");
  await expect(
    page.getByText("1 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Abrir revisão do exemplo", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Aceitar sugestão", exact: true })
    .click();
  await expect(
    page.getByText("Conferência registrada", { exact: true }),
  ).toBeVisible();
  await reviewDecision(page, "Aprovar publicação");
  await expect(
    page.getByRole("button", { name: "Retirar divulgação", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Demonstração guiada", exact: true })
    .click();
  await expect(
    page.getByText("3 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Gerar relato fictício" }).click();
  await expect(
    page.getByText("4 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Abrir revisão para retirar" }).click();
  await reviewDecision(page, "Retirar divulgação");
  await expect(
    page.getByText("A divulgação foi retirada.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Demonstração guiada", exact: true })
    .click();
  await expect(
    page.getByText("5 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reiniciar demonstração", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByText("5 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reiniciar demonstração", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar reinício", exact: true })
    .click();
  await expect(
    page.getByText("1 de 5 etapas concluídas", { exact: true }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test(`pilot surfaces accessible at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of [
      "/organization/settings",
      "/organization/notifications",
      "/organization/displays",
      "/organization/guide",
      "/screen",
      "/embed",
    ]) {
      await page.goto(path);
      await expect(
        page.locator("main h1,#main-content h1").first(),
      ).toBeVisible();
      if (path === "/screen" || path === "/embed")
        await expect(page.locator(".display-person")).toBeVisible();
      const report = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(report.violations, path).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        path,
      ).toBeTruthy();
    }
  });
