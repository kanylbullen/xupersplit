// Swedish demo of xupersplit with Swish as the settle rail.
// Drives the real prod app: skapa → utgift → saldon → gör upp med Swish.
//
//   node scripts/record-demo-sv.mjs
//
// Output: demo-out-sv/<random>.webm

import { chromium } from "playwright";

const BASE = "https://split.xuper.fun";
const OUT = "demo-out-sv";
const VW = 430;
const VH = 932;

const beat = (page, ms) => page.waitForTimeout(ms);

async function caption(page, text) {
  await page.evaluate((t) => {
    let el = document.getElementById("__cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "__cap";
      el.style.cssText = [
        "position:fixed","top:14px","left:50%","transform:translateX(-50%)",
        "max-width:88%","padding:11px 18px","background:rgba(13,18,30,0.92)",
        "color:#fff","font:600 16px/1.3 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
        "text-align:center","border-radius:14px","box-shadow:0 8px 30px rgba(0,0,0,0.35)",
        "z-index:2147483647","opacity:0","transition:opacity .35s ease","pointer-events:none","backdrop-filter:blur(2px)",
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

async function endCard(page) {
  await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.cssText = [
      "position:fixed","inset:0","background:#faf8f4","display:flex","flex-direction:column",
      "align-items:center","justify-content:center","gap:14px","z-index:2147483647","opacity:0",
      "transition:opacity .4s ease","font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    ].join(";");
    d.innerHTML =
      '<div style="font-weight:900;font-size:46px;letter-spacing:-1px;color:#0d9488">xupersplit</div>' +
      '<div style="font-weight:800;font-size:24px;color:#1c1917">Dela notan. Bli kvitt.</div>' +
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
    locale: "sv-SE",
    colorScheme: "light",
    recordVideo: { dir: OUT, size: { width: VW, height: VH } },
  });
  // Force Swedish via the locale cookie + skip the cookie banner.
  await ctx.addCookies([
    { name: "xupersplit:locale", value: "sv", domain: "split.xuper.fun", path: "/" },
  ]);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("xupersplit:cookie-ok", "1"); } catch {}
  });
  const page = await ctx.newPage();

  // 1) Hero
  await page.goto(BASE, { waitUntil: "networkidle" });
  await caption(page, "Resa ihop? Dela på notan.");
  await beat(page, 3200);

  // 2) Skapa en split
  await page.goto(`${BASE}/new`, { waitUntil: "networkidle" });
  await caption(page, "Starta en split — ingen inloggning");
  await beat(page, 1200);
  await page.getByRole("button", { name: /Enkel/ }).click();
  await beat(page, 700);
  await page.getByRole("textbox", { name: "Namn" }).pressSequentially("Helg i Åre", { delay: 70 });
  await beat(page, 400);
  await page.getByLabel("Valuta").selectOption("SEK");
  await beat(page, 400);
  await page.getByRole("textbox", { name: "Deltagare 1" }).pressSequentially("Mia", { delay: 70 });
  await page.getByRole("textbox", { name: "Deltagare 2" }).pressSequentially("Johan", { delay: 70 });
  await page.getByRole("textbox", { name: "Deltagare 3" }).pressSequentially("Sara", { delay: 70 });
  await beat(page, 800);
  await page.getByRole("button", { name: "Skapa xupersplit" }).click();
  await page.waitForURL(/\/k\//);
  await beat(page, 900);

  // 3) Välj vem du är
  await caption(page, "Välj vem du är");
  await page.getByRole("button", { name: /Mia/ }).first().click();
  await beat(page, 1200);

  // 4) Lägg Swish-nummer på Johan
  await caption(page, "Välj hur ni blir betalda — t.ex. Swish");
  await page.getByRole("button", { name: "Inställningar" }).click();
  await beat(page, 700);
  await page.getByRole("button", { name: "+ Lägg till betalsätt" }).nth(1).click();
  await beat(page, 600);
  const methodSelect = page
    .locator("select")
    .filter({ has: page.locator("option", { hasText: "Lightning" }) });
  await methodSelect.selectOption("Swish");
  await beat(page, 500);
  await page.getByPlaceholder(/07/).last().pressSequentially("070-123 45 67", { delay: 45 });
  await beat(page, 500);
  await page.getByRole("button", { name: "Spara" }).last().click();
  await beat(page, 800);
  await page.getByRole("button", { name: "Stäng" }).last().click();
  await beat(page, 700);

  // 5) Lägg in en utgift
  await caption(page, "Lägg in vad var och en la ut");
  await page.getByRole("button", { name: "+ Ny utgift" }).click();
  await beat(page, 700);
  await page.getByRole("textbox", { name: "Vad gäller det?" }).pressSequentially("Middag & vin", { delay: 55 });
  await page.getByRole("textbox", { name: /Belopp/ }).pressSequentially("1200", { delay: 90 });
  await beat(page, 400);
  await page.getByLabel("Vem betalade?").selectOption("Johan");
  await beat(page, 700);
  await page.getByRole("button", { name: "Spara" }).click();
  await beat(page, 1200);

  // 6) Saldon
  await caption(page, "Se direkt vem som är skyldig vad");
  await beat(page, 2800);

  // 7) Gör upp med Swish (a Swish-only recipient's button reads "Swisha")
  await caption(page, "Gör upp med Swish — skanna & betala");
  await page.getByRole("button", { name: "Swisha" }).first().click();
  await beat(page, 1200);
  await page.mouse.wheel(0, 220);
  await beat(page, 3200);
  await clearCaption(page);
  await beat(page, 400);

  // 8) Slut-skärm
  await endCard(page);
  await beat(page, 2800);

  const video = page.video();
  await ctx.close();
  await browser.close();
  console.log("VIDEO:", await video.path());
};

run().catch((e) => {
  console.error("RECORD_FAILED:", e.message);
  process.exit(1);
});
