import { test, expect } from "@playwright/test";

test("the editorial statement follows reading and settles under reduced motion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const title = page.getByRole("heading", {
    name: "Gentileza gera gentileza.",
    exact: true,
  });
  await title.scrollIntoViewIfNeeded();
  await expect(title).toBeVisible();
  const ribbon = page.locator("[data-kindness-ribbon]");
  const readTransform = () =>
    ribbon.evaluate((element) => getComputedStyle(element).transform);
  const before = await readTransform();
  await page.evaluate(() => window.scrollBy(0, -180));
  await expect.poll(readTransform).not.toBe(before);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  await page
    .getByRole("link", { name: "Faça parte dessa rede", exact: true })
    .click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.locator("#kindness-title")).toHaveCount(0);
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Lume, início" })
    .click();
  await title.scrollIntoViewIfNeeded();
  await expect(title).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  expect(errors).toEqual([]);
});
