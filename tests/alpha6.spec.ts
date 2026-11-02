import { test, expect } from "@playwright/test";

test("the light network follows the last city and settles after resize and reduced motion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-connection]")).toHaveCount(3);
  await expect
    .poll(() =>
      page
        .locator("[data-hero-beat]")
        .evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).opacity === "1"),
        ),
    )
    .toBe(true);
  for (const city of ["Suzano", "São Paulo", "Guarulhos"]) {
    await page.getByRole("button", { name: city, exact: true }).click();
  }
  const destination = page.locator('[data-connection="Guarulhos"]');
  await expect
    .poll(() =>
      destination.evaluate((node) =>
        parseFloat((node as SVGElement).style.strokeDashoffset),
      ),
    )
    .toBe(0);
  await expect
    .poll(() =>
      page
        .locator('[data-connection="Suzano"]')
        .evaluate((node) =>
          parseFloat((node as SVGElement).style.strokeDashoffset),
        ),
    )
    .toBeGreaterThan(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Suzano", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page
    .getByRole("link", { name: "Ver avisos em Suzano", exact: true })
    .click();
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.locator(".case-card")).toContainText("Marcos Oliveira");
  expect(errors).toEqual([]);
});

test("Mavis responsive stacks and linked cards preserve keyboard navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect
    .poll(() =>
      page
        .locator(".care-step")
        .evaluateAll(
          (nodes) =>
            Math.abs(
              nodes[0]!.getBoundingClientRect().top -
                nodes[1]!.getBoundingClientRect().top,
            ) < 2,
        ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page
        .locator(".care-step")
        .evaluateAll(
          (nodes) =>
            nodes[1]!.getBoundingClientRect().top >=
            nodes[0]!.getBoundingClientRect().bottom,
        ),
    )
    .toBe(true);
  expect(
    await page
      .locator(".hero-primary")
      .evaluate((node) => ({
        tag: node.tagName,
        href: node.getAttribute("href"),
      })),
  ).toEqual({ tag: "A", href: "/cases" });
  const card = page.locator(".case-card").first();
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  await expect(card).toBeFocused();
  expect(await card.evaluate((node) => node.tagName)).toBe("A");
  await expect(card.locator("a,button")).toHaveCount(0);
  await card.press("Enter");
  await expect(page).toHaveURL(/\/cases\/ana-lucia$/);
  await expect(
    page.getByRole("heading", { name: "Ana Lúcia Ferreira", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
