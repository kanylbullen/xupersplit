import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const SMOKE_KEY = process.env.SMOKE_SPLIT_KEY;

// App renders English from the en-GB locale set in playwright.config.ts.

test("landing page renders with a create button", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Xupersplit/);
  await expect(
    page.getByRole("link", { name: /create a new xupersplit/i })
  ).toBeVisible();
});

// The whole point of the landing card and hero pill is that /mcp stops being
// findable only from the footer — so assert the routes above the footer exist.
test("landing page points at the MCP server", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /works with claude/i })
  ).toBeVisible();
  // Matched loosely: the origin follows NEXT_PUBLIC_APP_ORIGIN, so it differs
  // between a preview deployment and production.
  await expect(page.getByText(/\/api\/mcp$/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /how to connect it/i })
  ).toBeVisible();
});

test("help page carries all four sections and reachable example prompts", async ({
  page,
}) => {
  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "Help & getting started" })
  ).toBeVisible();
  // The anchors the table of contents jumps to — a renamed id silently breaks
  // every one of those links.
  for (const id of ["start", "examples", "ai", "faq"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Copy" }).first()).toBeVisible();
});

test("the landing footer reaches the help page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "help", exact: true }).click();
  await expect(page).toHaveURL(/\/help$/);
});

test("account menu holds language, theme and log in", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("summary").filter({ hasText: "Menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("combobox")).toBeVisible(); // language switcher
  await expect(page.getByRole("button", { name: "System" })).toBeVisible();
  // Exact, or it also matches the footer's lowercase "help" link.
  await expect(page.getByRole("link", { name: "Help", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  // Escape closes it again.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Log in" })).toBeHidden();
});

test("FX endpoint returns a numeric rate", async ({ request }) => {
  const res = await request.get("/api/fx?from=EUR&to=SEK");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(typeof body.rate).toBe("number");
  expect(body.rate).toBeGreaterThan(0);
});

// ── MCP endpoint ─────────────────────────────────────────────────────────────
// Stateless Streamable HTTP: a POST carrying JSON-RPC, answered as a one-shot
// SSE frame. Both Accept types are required by the transport.
const MCP_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

async function mcp(
  request: APIRequestContext,
  method: string,
  params: unknown,
  id: number
) {
  const res = await request.post("/api/mcp", {
    headers: MCP_HEADERS,
    data: { jsonrpc: "2.0", id, method, params },
  });
  expect(res.ok(), `${method} should return 2xx`).toBeTruthy();
  const body = await res.text();
  const line = body.split("\n").find((l) => l.startsWith("data: "));
  return JSON.parse(line ? line.slice(6) : body);
}

async function mcpSession(request: APIRequestContext) {
  const init = await mcp(
    request,
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "playwright-smoke", version: "1" },
    },
    1
  );
  expect(init.result.serverInfo.name).toBe("xupersplit");
  return init;
}

test("MCP endpoint advertises the split tools", async ({ request }) => {
  await mcpSession(request);
  const listed = await mcp(request, "tools/list", {}, 2);
  const names = listed.result.tools.map((t: { name: string }) => t.name);
  // The lifecycle an agent needs; the rest may grow without failing CI.
  for (const tool of ["create_split", "get_split", "add_expense", "record_payment"]) {
    expect(names, `tools/list should include ${tool}`).toContain(tool);
  }
});

// An agent reading a receipt gets no second chance: it either asks about the
// line it can't place, or it averages the cost onto someone who never ordered
// it and the total still comes out right. That guidance lives entirely in two
// strings served over the wire, so nothing else here would notice them going
// missing in a refactor.
test("MCP tells agents to ask rather than guess", async ({ request }) => {
  const init = await mcpSession(request);
  expect(init.result.instructions).toContain("ask rather than spreading");

  const listed = await mcp(request, "tools/list", {}, 2);
  const addExpense = listed.result.tools.find(
    (t: { name: string }) => t.name === "add_expense",
  ) as
    | { inputSchema: { properties: { paid_by?: { description?: string } } } }
    | undefined;
  expect(addExpense?.inputSchema.properties.paid_by?.description).toContain(
    "ask unless you know",
  );
});

// Skip the split-dependent tests if no smoke split is configured (e.g. a fork).
test.describe(() => {
  test.skip(!SMOKE_KEY, "SMOKE_SPLIT_KEY not set");

  test("MCP get_split reads the smoke split", async ({ request }) => {
    await mcpSession(request);
    const called = await mcp(
      request,
      "tools/call",
      { name: "get_split", arguments: { split: SMOKE_KEY } },
      3
    );
    expect(called.result.isError, called.result.content?.[0]?.text).toBeFalsy();
    const split = called.result.structuredContent;
    expect(split.key).toBe(SMOKE_KEY);
    expect(split.title).toBeTruthy();
    expect(Array.isArray(split.participants)).toBe(true);
    // Balances always net to zero, whatever is in the split.
    const net = split.participants.reduce(
      (sum: number, p: { balance: number }) => sum + p.balance,
      0
    );
    expect(Math.abs(net)).toBeLessThan(0.001);
  });

  test("MCP rejects an unknown split key", async ({ request }) => {
    await mcpSession(request);
    const called = await mcp(
      request,
      "tools/call",
      { name: "get_split", arguments: { split: "0".repeat(32) } },
      4
    );
    expect(called.result.isError).toBe(true);
    expect(called.result.content[0].text).toContain("No split with key");
  });

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
