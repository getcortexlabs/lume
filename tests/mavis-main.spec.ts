import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function choose(page: Page, id: string, label: string) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
test("Mavis date calendar selects a civil date and returns focus", async ({
  page,
}) => {
  await page.goto("/cases");
  const trigger = page.getByRole("button", {
    name: "Escolher data: A partir de",
    exact: true,
  });
  await trigger.click();
  const calendar = page.getByRole("dialog");
  await expect(calendar).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(calendar).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByLabel("A partir de", { exact: true }).fill("2026-10-28");
  await expect(page).toHaveURL(/from=2026-10-28/);
  await trigger.click();
  await expect(calendar).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(calendar).not.toBeVisible();
  await expect(page.getByLabel("A partir de", { exact: true })).toHaveValue(
    "2026-10-29",
  );
  await expect(page).toHaveURL(/from=2026-10-29/);
});
test("partial dates survive draft reload and cannot pass intake validation", async ({
  page,
}) => {
  await page.goto("/organization/cases/new");
  await page
    .getByLabel("Nome fictício", { exact: true })
    .fill("Exemplo de data parcial");
  await page.getByLabel("Idade", { exact: true }).fill("45");
  await choose(page, "intake-city", "Suzano");
  await page.getByLabel("Região para divulgação").fill("Centro");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByLabel("Data do desaparecimento", { exact: true })
    .fill("2026-1");
  await page
    .getByLabel("Informações públicas do aviso")
    .fill("Exemplo fictício.");
  await page.getByLabel("Vestuário informado").fill("Não informado.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByText("Informe uma data válida, até hoje.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Salvo neste navegador.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByLabel("Data do desaparecimento", { exact: true }),
  ).toHaveValue("2026-1");
  await page
    .getByLabel("Data do desaparecimento", { exact: true })
    .fill("2026-10-25");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByLabel("Origem da informação", { exact: true }),
  ).toBeVisible();
});
test("Jolt top-layer dialog works with a transformed page ancestor", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cases");
  await expect(page.locator(".case-card")).toHaveCount(4);
  await page.locator(".page-section").evaluate((el) => {
    (el as HTMLElement).style.transform = "translateX(2px)";
  });
  await choose(page, "filter-city", "Suzano");
  await expect(page.locator(".case-card")).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("Mavis calendar remains accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cases");
  await page
    .getByRole("button", { name: "Escolher data: A partir de", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(report.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
});
