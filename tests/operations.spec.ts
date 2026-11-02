import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function choose(page: Page, id: string, label: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

test("manage a source, inspect imported records and recover a failed consultation", async ({
  page,
}) => {
  await page.goto("/organization/sources");
  const partner = page
    .locator(".source-card-managed")
    .filter({ hasText: "Arquivo do parceiro" });
  await partner
    .getByRole("button", { name: "Simular consulta", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Tempo limite");
  await partner.getByRole("button", { name: "Simular recuperação" }).click();
  await expect(partner).toContainText("Disponível");
  await partner.getByRole("button", { name: /Inspecionar registros/ }).click();
  await expect(partner).toContainText("Municípios diferentes");
  await partner.getByRole("link", { name: "Inspecionar na revisão" }).click();
  await expect(page).toHaveURL(/case=antonio-lima/);
  await page.getByRole("link", { name: "Gerenciar fontes" }).click();
  await page.getByRole("button", { name: "Cadastrar fonte" }).click();
  await page
    .getByLabel("Nome da fonte", { exact: true })
    .fill("Fonte do piloto fictício");
  await page
    .getByLabel("Responsável pela fonte")
    .fill("Equipe de demonstração");
  await page.getByLabel("Intervalo entre consultas (horas)").fill("6");
  await page.getByRole("button", { name: "Salvar fonte" }).click();
  const source = page
    .locator(".source-card-managed")
    .filter({ hasText: "Fonte do piloto fictício" });
  await expect(source).toContainText("a cada 6 hora(s)");
  await source.getByRole("button", { name: "Editar fonte" }).click();
  await page
    .getByRole("checkbox", { name: "Fonte ativa na demonstração" })
    .uncheck();
  await page.getByRole("button", { name: "Salvar fonte" }).click();
  await expect(
    source.getByRole("button", { name: "Simular consulta", exact: true }),
  ).toBeDisabled();
});

test("drafts can be duplicated and deleted with an explicit confirmation", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Cadastro duplicável");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("link", { name: "Retomar rascunhos" }).click();
  await page.getByRole("button", { name: "Duplicar rascunho" }).click();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Duplicar rascunho" }).last().click();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Excluir rascunho" }).first().click();
  await expect(
    page.getByRole("dialog", { name: "Excluir este rascunho?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(2);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Retomar cadastro" }),
  ).toHaveCount(2);
});

test("two tabs resolve a draft conflict by explicitly choosing the changed field", async ({
  page,
  context,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Versão inicial");
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/draft=draft-/);
  const other = await context.newPage();
  await other.goto(page.url());
  await other
    .getByLabel("Nome fictício", { exact: true })
    .fill("Edição da outra aba");
  await expect(
    other.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Minha edição preservada");
  const panel = page.getByRole("region", {
    name: "Resolver conflito do rascunho",
  });
  await expect(panel).toContainText("Edição da outra aba");
  await expect(
    panel.getByRole("button", { name: "Combinar e salvar" }),
  ).toBeDisabled();
  await choose(page, "conflict-name", "Minha edição");
  await panel.getByRole("button", { name: "Combinar e salvar" }).click();
  await expect(panel).not.toBeVisible();
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await other.reload();
  await expect(other.getByLabel("Nome fictício", { exact: true })).toHaveValue(
    "Minha edição preservada",
  );
});

test("withdrawal distinguishes expired copies from a confirmed removal", async ({
  page,
}) => {
  await page.goto("/organization/network");
  await choose(page, "partner-connection", "Sem conexão");
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await page.getByRole("button", { name: /Ana Lúcia Ferreira/ }).click();
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Retirada fictícia para acompanhar os canais.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Retirar divulgação" }).click();
  await page
    .getByRole("link", { name: "Acompanhar retirada nos canais" })
    .click();
  await expect(page.locator(".withdrawal-report")).toContainText(
    "Aguardando retirada",
  );
  await page.getByRole("button", { name: "Tentar retirada novamente" }).click();
  await expect(page.getByRole("alert")).toContainText("Reconecte o canal");
  await page.getByRole("link", { name: "Inspecionar canal" }).click();
  await page.getByRole("button", { name: "Simular validade expirada" }).click();
  await page.goBack();
  await expect(page.locator(".withdrawal-report")).toContainText(
    "Cópia expirada, sem confirmação",
  );
  await page.getByRole("link", { name: "Inspecionar canal" }).click();
  await choose(page, "partner-connection", "Conectado");
  await page.goBack();
  await expect(page.locator(".withdrawal-report")).toContainText(
    "Retirada confirmada",
  );
});

test("private tips preserve uncertainty through triage, forwarding and recipient confirmation", async ({
  page,
}) => {
  await page.goto("/organization/tips");
  await page.getByRole("button", { name: "Receber relato de exemplo" }).click();
  const workspace = page.locator(".tip-workspace");
  await expect(workspace).toContainText("Acho que vi alguém parecido");
  await workspace
    .getByLabel("Registro da etapa")
    .fill("Incerteza e horário aproximado preservados.");
  await workspace.getByRole("button", { name: "Concluir triagem" }).click();
  await workspace
    .getByLabel("Registro da etapa")
    .fill("Envio fictício para a equipe responsável.");
  await choose(page, "tip-recipient", "Equipe de buscas fictícia");
  await workspace
    .getByRole("button", { name: "Simular encaminhamento" })
    .click();
  await expect(workspace).toContainText("ainda não confirmou recebimento");
  await workspace
    .getByLabel("Registro da etapa")
    .fill("Recebimento confirmado pelo destinatário fictício.");
  await workspace
    .getByRole("button", { name: "Simular confirmação do destinatário" })
    .click();
  await expect(workspace).toContainText(
    "Isso não confirma a veracidade do relato",
  );
  await expect(workspace).toContainText("Não tenho certeza");
  await page
    .getByRole("link", { name: "Área da organização", exact: true })
    .click();
  await page.getByRole("link", { name: "Cenários de demonstração" }).click();
  await expect(page.locator(".http-trace-panel")).toContainText("/transitions");
  await expect(page.locator(".http-trace-panel")).not.toContainText(
    "testemunha@example.com",
  );
});

test("HTTP simulation denies the new private modules and recovers after restoring the reviewer", async ({
  page,
}) => {
  await page.goto("/organization/simulation");
  await choose(page, "simulation-role", "Somente consulta pública");
  await page.getByRole("button", { name: "Aplicar cenário" }).click();
  await page.getByRole("link", { name: "Experimentar revisão" }).click();
  for (const link of [
    "Gerenciar fontes",
    "Relatos de demonstração",
    "Acompanhar retiradas",
  ]) {
    await page.getByRole("link", { name: link, exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(
      "só pode consultar avisos públicos",
    );
    await page.getByRole("link", { name: "Voltar à organização" }).click();
  }
  await page.getByRole("link", { name: "Cenários de demonstração" }).click();
  await expect(page.locator(".http-trace-panel")).toContainText("403");
  await page.getByRole("button", { name: "Restaurar operação normal" }).click();
  await page.getByRole("link", { name: "Experimentar revisão" }).click();
  await page.getByRole("link", { name: "Relatos de demonstração" }).click();
  await expect(page.locator(".tip-workspace")).toBeVisible();
});

for (const width of [390, 1440])
  test(`new private modules are accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of [
      "/organization/sources",
      "/organization/tips",
      "/organization/withdrawals",
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
