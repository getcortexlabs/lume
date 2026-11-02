import { test, expect } from "@playwright/test";

test("Reveal interpolates intrinsic height in both directions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/organization");
  const toggle = page.getByRole("button", { name: "Simular apoio da IA" });
  await toggle.focus();
  const sizes = await toggle.evaluate(async (button) => {
    async function sample(final: string) {
      const heights: number[] = [];
      const start = performance.now();
      let settled = false;
      do {
        await new Promise(requestAnimationFrame);
        const panel = document.getElementById("ai-evidence");
        heights.push(panel?.getBoundingClientRect().height ?? 0);
        settled = final === "closed" ? !panel : panel?.dataset.state === final;
      } while (!settled && performance.now() - start < 3000);
      return heights;
    }
    (button as HTMLElement).click();
    const opening = await sample("open");
    const natural = document
      .getElementById("ai-evidence")!
      .getBoundingClientRect().height;
    (button as HTMLElement).click();
    const closing = await sample("closed");
    return { opening, closing, natural };
  });
  expect(sizes.natural).toBeGreaterThan(40);
  for (const sequence of [sizes.opening, sizes.closing]) {
    expect(sequence.some((h) => h > 1 && h < sizes.natural - 1)).toBeTruthy();
  }
  await expect(page.locator("#ai-evidence")).toBeHidden();
  await toggle.click();
  const panel = page.locator("#ai-evidence");
  await expect(panel).toHaveAttribute("data-state", "open");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await panel.evaluate((el) => ({
      auto: (el as HTMLElement).style.height,
      fits: el.scrollHeight <= el.clientHeight + 1,
      fitsViewport: el.getBoundingClientRect().right <= window.innerWidth,
    })),
  ).toEqual({ auto: "auto", fits: true, fitsViewport: true });
});

test("Reveal restores focus, hides closing controls and tolerates rapid reversals", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/organization/sources");
  const card = page
    .locator(".source-card-managed")
    .filter({ hasText: "Arquivo do parceiro" });
  const toggle = card.getByRole("button", { name: /Inspecionar registros/ });
  const panel = card.locator(".m-reveal");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(panel).toHaveAttribute("data-state", "open");
  await card.getByRole("link", { name: "Inspecionar na revisão" }).focus();
  const closed = await toggle.evaluate(async (button) => {
    (button as HTMLElement).click();
    await new Promise(requestAnimationFrame);
    const panel = document.getElementById(
      button.getAttribute("aria-controls")!,
    )!;
    return {
      inert: panel.inert,
      hidden: panel.getAttribute("aria-hidden"),
      focused: document.activeElement === button,
    };
  });
  expect(closed).toEqual({ inert: true, hidden: "true", focused: true });
  await toggle.evaluate(async (button) => {
    for (let n = 0; n < 5; n++) {
      (button as HTMLElement).click();
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    }
  });
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect(panel).not.toHaveAttribute("inert", "");
  await card.getByRole("link", { name: "Inspecionar na revisão" }).focus();
  await expect(
    card.getByRole("link", { name: "Inspecionar na revisão" }),
  ).toBeFocused();
  // Navigate during collapse: no pending completion may touch the next page.
  await toggle.evaluate((button) => (button as HTMLElement).click());
  await page.getByRole("link", { name: "Voltar à organização" }).click();
  await expect(page.locator(".review-editor")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Reveal respects reduced motion in the network and display views", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/network");
  await page.getByRole("button", { name: "Ver configuração" }).click();
  await expect(page.locator("#network-config-details")).toHaveAttribute(
    "data-state",
    "open",
  );
  await page.getByRole("button", { name: "Ocultar configuração" }).click();
  await expect(page.locator("#network-config-details")).toBeHidden();
  await page.goto("/screen");
  const toggle = page.getByRole("button", { name: "Testar funcionamento" });
  await toggle.focus();
  const frames = await toggle.evaluate(async (button) => {
    (button as HTMLElement).click();
    let frames = 0;
    while (
      document.querySelector<HTMLElement>(".m-reveal")?.dataset.state !==
        "open" &&
      frames < 20
    ) {
      await new Promise(requestAnimationFrame);
      frames++;
    }
    return frames;
  });
  expect(frames).toBeLessThanOrEqual(4);
  await expect(
    page.getByRole("button", { name: "Simular offline" }),
  ).toBeVisible();
});
