import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function choose(page: Page, id: string, label: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

test("date semantics and pagination persist in the public URL", async ({
  page,
}) => {
  await page.goto("/cases");
  await page.getByLabel("A partir de", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Até", { exact: true }).fill("2026-10-29");
  await expect(page.locator(".case-card")).toHaveCount(2);
  await choose(page, "filter-date-field", "Revisão da divulgação");
  await expect(page.getByText("Nenhum aviso por aqui.")).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click();
  await choose(page, "case-page-size", "2 avisos");
  await expect(page.locator(".case-card")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await expect(page).toHaveURL(/page=2/);
  await page.reload();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await page.locator(".case-link").first().click();
  await expect(page.locator("h1")).toHaveText("Marcos Oliveira");
  await page.getByRole("link", { name: "Próximo aviso", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Pedro Almeida");
  await page.getByRole("link", { name: "Voltar para minha busca" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
});

test("draft can be resumed, reviewed, published and withdrawn without leaking its source document", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Informe o nome fictício",
  );
  await page.getByLabel("Nome fictício", { exact: true }).fill("Clara Exemplo");
  await page.getByLabel("Idade", { exact: true }).fill("42");
  await choose(page, "intake-city", "São Paulo");
  await page.getByLabel("Região para divulgação").fill("Centro");
  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page).toHaveURL(/\/organization\/drafts\/draft-[a-f0-9-]+/);
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("link", { name: "Retomar rascunhos" }).click();
  await page.getByRole("link", { name: "Retomar cadastro" }).click();
  await expect(page.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Clara Exemplo",
  );
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByLabel("Data do desaparecimento", { exact: true })
    .fill("2026-10-25");
  await page
    .getByLabel("Informações públicas do aviso")
    .fill("Registro fictício autorizado para teste.");
  await page.getByLabel("Vestuário informado").fill("Não informado.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByLabel("Origem da informação", { exact: true })
    .fill("Instituição fictícia");
  await page
    .getByLabel("Registro reservado para revisão")
    .fill("DOCUMENTO RESERVADO 12345");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator(".draft-preview")).not.toContainText(
    "DOCUMENTO RESERVADO",
  );
  await page.getByRole("button", { name: "Enviar para revisão" }).click();
  await expect(page).toHaveURL(/\/organization\?case=case-draft-[a-f0-9-]+/);
  await expect(page.locator(".review-editor h2")).toHaveText("Clara Exemplo");
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Fonte e campos conferidos.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Aprovar publicação" }).click();
  await page.getByRole("link", { name: "Ver página pública" }).click();
  await expect(page.locator("h1")).toHaveText("Clara Exemplo");
  await expect(page.locator("main")).not.toContainText("DOCUMENTO RESERVADO");
  await page.goBack();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Revalidação dos campos públicos.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Revalidar divulgação" }).click();
  await expect(
    page.getByText("Divulgação revalidada", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Retirada da demonstração.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Retirar divulgação" }).click();
  await expect(
    page.getByText("A divulgação foi retirada.", { exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(page.locator("h1")).toHaveText(
    "A divulgação deste aviso foi retirada.",
  );
  await expect(page.locator("main")).not.toContainText("Clara Exemplo");
});

test("review conflict requires a supported correction before publication", async ({
  page,
}) => {
  await page.goto("/organization?case=antonio-lima");
  await expect(
    page.getByText("Fontes divergentes", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Tentativa sem resolver divergência.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Aprovar publicação" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Resolva as divergências",
  );
  await page.getByRole("button", { name: "Corrigir com evidência" }).click();
  await page.getByLabel("Valor corrigido").fill("Guarulhos");
  await page.getByLabel("Trecho exato da fonte").fill("Município: Guarulhos");
  await page
    .getByLabel("Motivo da correção")
    .fill("Conferido o registro original.");
  await page.getByRole("button", { name: "Registrar correção" }).click();
  await expect(
    page.getByText("Conferência registrada", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Campo corrigido pelo revisor", { exact: true }),
  ).toBeVisible();
});

test("partner preview expires offline and recovers on reconnection", async ({
  page,
}) => {
  await page.goto("/organization/network");
  await expect(page.locator(".partner-widget")).toContainText(
    "Ana Lúcia Ferreira",
  );
  await choose(page, "partner-connection", "Sem conexão");
  await page.getByRole("button", { name: "Simular validade expirada" }).click();
  await expect(page.locator(".partner-widget")).not.toContainText(
    "Ana Lúcia Ferreira",
  );
  await choose(page, "partner-connection", "Conectado");
  await expect(page.locator(".partner-widget")).toContainText(
    "Ana Lúcia Ferreira",
  );
  await page
    .getByRole("button", { name: "Inspecionar Mercado Horizonte" })
    .click();
  await page.getByRole("button", { name: "Revalidar canal" }).click();
  await expect(page.getByRole("alert")).toContainText("Reconecte o canal");
});

test("simulated failures and permission limits can be recovered in the same session", async ({
  page,
}) => {
  await page.goto("/organization/simulation");
  await choose(page, "simulation-latency", "1,2 segundo");
  await page
    .getByRole("checkbox", { name: "Simular serviço indisponível" })
    .check();
  await page.getByRole("button", { name: "Aplicar cenário" }).click();
  await page.getByRole("link", { name: "Experimentar busca pública" }).click();
  await expect(page.getByRole("alert")).toContainText("Serviço indisponível");
  await page.getByRole("link", { name: "Área da organização" }).click();
  await page.getByRole("link", { name: "Cenários de demonstração" }).click();
  await page.getByRole("button", { name: "Restaurar operação normal" }).click();
  await choose(page, "simulation-role", "Somente consulta pública");
  await page.getByRole("button", { name: "Aplicar cenário" }).click();
  await page.getByRole("link", { name: "Experimentar revisão" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "só pode consultar avisos públicos",
  );
  await expect(page.locator(".review-workspace")).toHaveCount(0);
  await page.getByRole("link", { name: "Cenários de demonstração" }).click();
  await page.getByRole("button", { name: "Restaurar operação normal" }).click();
  await page.getByRole("link", { name: "Experimentar busca pública" }).click();
  await expect(page.locator(".case-card")).toHaveCount(4);
});

for (const width of [390, 1440])
  test(`new organization journeys are accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of [
      "/organization/cases/new",
      "/organization/drafts",
      "/organization/network",
      "/organization/simulation",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
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
    expect(errors).toEqual([]);
  });
