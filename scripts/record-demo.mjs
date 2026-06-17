// Records a marketing demo of the real xupersplit app (prod) into a .webm.
// Drives the actual UI: create → expense → balances → settle onchain (USDC).
// Captions are injected as an overlay so the raw recording is self-explanatory.
//
//   node scripts/record-demo.mjs
//
// Output: demo-out/<random>.webm  (convert to mp4/gif with scripts/convert-demo.sh)

import { chromium } from "playwright";

const BASE = "https://split.xuper.fun";
const OUT = "demo-out";

// ~2x retina for crisp text/video.
const VW = 430;
const VH = 932;

const beat = (page, ms) => page.waitForTimeout(ms);

// Upsert a caption pill near the top. Re-injected after each navigation.
async function caption(page, text) {
  await page.evaluate((t) => {
    let el = document.getElementById("__cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "__cap";
      el.style.cssText = [
        "position:fixed",
        "top:14px",
        "left:50%",
        "transform:translateX(-50%)",
        "max-width:88%",
        "padding:11px 18px",
        "background:rgba(13,18,30,0.92)",
        "color:#fff",
        "font:600 16px/1.3 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
        "text-align:center",
        "border-radius:14px",
        "box-shadow:0 8px 30px rgba(0,0,0,0.35)",
        "z-index:2147483647",
        "opacity:0",
        "transition:opacity .35s ease",
        "pointer-events:none",
        "backdrop-filter:blur(2px)",
      ].join(";");
      document.body.appendChild(el);
    }
    el.textContent = t;
    requestAnimationFrame(() => (el.style.opacity = "1"));
  }, text);
}

async function clearCaption(page) {
  await page.evaluate(() => {
    const el = document.getElementById("__cap");
    if (el) el.style.opacity = "0";
  });
}

// Full-screen brand end card.
async function endCard(page) {
  await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.cssText = [
      "position:fixed",
      "inset:0",
      "background:#faf8f4",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "justify-content:center",
      "gap:14px",
      "z-index:2147483647",
      "opacity:0",
      "transition:opacity .4s ease",
      "font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    ].join(";");
    d.innerHTML =
      '<div style="font-weight:900;font-size:46px;letter-spacing:-1px;color:#0d9488">xupersplit</div>' +
      '<div style="font-weight:800;font-size:24px;color:#1c1917">Split bills. Settle onchain.</div>' +
      '<div style="margin-top:6px;font-weight:600;font-size:18px;color:#78716c">split.xuper.fun</div>';
    document.body.appendChild(d);
    requestAnimationFrame(() => (d.style.opacity = "1"));
  });
}

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH },
    deviceScaleFactor: 2,
    locale: "en-US",
    colorScheme: "light",
    // size == viewport; deviceScaleFactor:2 makes it a crisp supersampled render.
    recordVideo: { dir: OUT, size: { width: VW, height: VH } },
  });
  // Skip the cookie banner so it never shows in the clip.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("xupersplit:cookie-ok", "1");
    } catch {}
  });
  const page = await ctx.newPage();

  // 1) Landing / hero
  await page.goto(BASE, { waitUntil: "networkidle" });
  await caption(page, "Group trip? Shared dinners?");
  await beat(page, 3200);

  // 2) Create a split
  await page.goto(`${BASE}/new`, { waitUntil: "networkidle" });
  await caption(page, "Start a split — no sign-up");
  await beat(page, 1200);
  await page.getByRole("button", { name: /Simple/ }).click();
  await beat(page, 700);
  await page.getByRole("textbox", { name: "Name" }).pressSequentially("Lisbon weekend", { delay: 70 });
  await beat(page, 400);
  await page.getByLabel("Currency").selectOption("USD");
  await beat(page, 400);
  await page.getByRole("textbox", { name: "Participant 1" }).pressSequentially("Mia", { delay: 70 });
  await page.getByRole("textbox", { name: "Participant 2" }).pressSequentially("Alex", { delay: 70 });
  await page.getByRole("textbox", { name: "Participant 3" }).pressSequentially("Sam", { delay: 70 });
  await beat(page, 800);
  await page.getByRole("button", { name: "Create xupersplit" }).click();
  await page.waitForURL(/\/k\//);
  await beat(page, 900);

  // 3) Pick yourself
  await caption(page, "Pick yourself");
  await page.getByRole("button", { name: /^M\s*Mia$/ }).click();
  await beat(page, 1200);

  // 4) Set how Alex gets paid (crypto rail)
  await caption(page, "Choose how to get paid — incl. crypto");
  await page.getByRole("button", { name: "Settings" }).click();
  await beat(page, 700);
  await page.getByRole("button", { name: "+ Add payment method" }).nth(1).click();
  await beat(page, 600);
  // The payment-method select is the only one with a "Lightning" option.
  const methodSelect = page
    .locator("select")
    .filter({ has: page.locator("option", { hasText: "Lightning" }) });
  await methodSelect.selectOption("Ethereum");
  await beat(page, 500);
  await page
    .getByPlaceholder(/0x/)
    .last()
    .pressSequentially("0x8ba1f109551bD432803012645Ac136ddd64DBA72", { delay: 18 });
  await beat(page, 500);
  await page.getByRole("button", { name: "Save" }).last().click();
  await beat(page, 800);
  await page.getByRole("button", { name: "Close" }).last().click();
  await beat(page, 700);

  // 5) Add an expense
  await caption(page, "Log what everyone spent");
  await page.getByRole("button", { name: "+ New expense" }).click();
  await beat(page, 700);
  await page.getByRole("textbox", { name: "What's it for?" }).pressSequentially("Dinner & wine", { delay: 55 });
  await page.getByRole("textbox", { name: "Amount" }).pressSequentially("120", { delay: 90 });
  await beat(page, 400);
  await page.getByLabel("Who paid?").selectOption("Alex");
  await beat(page, 700);
  await page.getByRole("button", { name: "Save" }).click();
  await beat(page, 1200);

  // 6) Balances
  await caption(page, "Instantly see who owes whom");
  await beat(page, 2800);

  // 7) Settle onchain
  await caption(page, "Settle up onchain — pay in USDC");
  await page.getByRole("button", { name: "Pay" }).first().click();
  await beat(page, 1200);
  // Reveal the network picker + connect-wallet CTA.
  await page.mouse.wheel(0, 240);
  await beat(page, 3200);
  await clearCaption(page);
  await beat(page, 400);

  // 8) End card
  await endCard(page);
  await beat(page, 2800);

  const video = page.video();
  await ctx.close();
  await browser.close();
  const path = await video.path();
  console.log("VIDEO:", path);
};

run().catch((e) => {
  console.error("RECORD_FAILED:", e.message);
  process.exit(1);
});
