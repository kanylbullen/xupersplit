import { test, expect, type Page } from "@playwright/test";

const SMOKE_KEY = process.env.SMOKE_SPLIT_KEY;

// App renders English from the en-GB locale set in playwright.config.ts.

test("landing page renders with a create button", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Xupersplit/);
  await expect(
    page.getByRole("link", { name: /create a new xupersplit/i })
  ).toBeVisible();
});

test("FX endpoint returns a numeric rate", async ({ request }) => {
  const res = await request.get("/api/fx?from=EUR&to=SEK");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(typeof body.rate).toBe("number");
  expect(body.rate).toBeGreaterThan(0);
});

// Skip the split-dependent tests if no smoke split is configured (e.g. a fork).
test.describe(() => {
  test.skip(!SMOKE_KEY, "SMOKE_SPLIT_KEY not set");

  // Pre-select an identity so the "Who are you?" dialog doesn't block.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      // Identity key prefix (see SplitApp).
      localStorage.setItem(`xupersplit:me:${key}`, "viewer");
      // Dismiss the cookie notice so it doesn't overlap the bottom action bar.
      localStorage.setItem("xupersplit:cookie-ok", "1");
    }, SMOKE_KEY);
  });

  async function openExpenseDialog(page: Page) {
    await page.goto(`/k/${SMOKE_KEY}`);
    await page.getByRole("button", { name: "+ New expense" }).click();
    await expect(page.getByRole("heading", { name: "New expense" })).toBeVisible();
  }

  test("amount field stays usable (regression: it once collapsed)", async ({
    page,
  }) => {
    await openExpenseDialog(page);
    const amount = page.locator("#entry-amount");
    await expect(amount).toBeVisible();
    const box = await amount.boundingBox();
    expect(box, "amount input should have a bounding box").not.toBeNull();
    // Before the fix the field shrank to ~30px on mobile and was unusable.
    expect(box!.width).toBeGreaterThan(100);
    await amount.fill("123");
    await expect(amount).toHaveValue("123");
  });

  test("create, verify and remove an expense", async ({ page }) => {
    const desc = `ci-smoke ${Date.now()}`;
    await openExpenseDialog(page);

    await page.getByRole("textbox", { name: "What's it for?" }).fill(desc);
    await page.locator("#entry-amount").fill("200");
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();

    // It shows up under Transactions with the right amount.
    await page.getByRole("button", { name: "Transactions" }).click();
    const row = page.getByRole("button", { name: new RegExp(desc) });
    await expect(row).toBeVisible();
    await expect(row).toContainText("200");

    // Clean up: open it and delete so the smoke split stays empty.
    await row.click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Delete?", exact: true }).click();
    await expect(
      page.getByRole("button", { name: new RegExp(desc) })
    ).toHaveCount(0);
  });
});
