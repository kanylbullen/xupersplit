import type { NextRequest } from "next/server";

// Proxy for Swish's public prefilled-QR generator (it has no CORS headers,
// so the browser can't call it directly).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number") ?? "";
  const amountCents = Number(searchParams.get("amount") ?? "");
  const message = (searchParams.get("msg") ?? "").slice(0, 50);

  if (!/^07\d{8}$/.test(number) || !Number.isInteger(amountCents) || amountCents <= 0) {
    return new Response("Bad request", { status: 400 });
  }

  const upstream = await fetch(
    "https://mpc.getswish.net/qrg-swish/api/v1/prefilled",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format: "png",
        size: 400,
        payee: { value: number, editable: false },
        amount: { value: amountCents / 100, editable: false },
        message: { value: message, editable: false },
      }),
    }
  );

  if (!upstream.ok) {
    return new Response("QR generation failed", { status: 502 });
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
