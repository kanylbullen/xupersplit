import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/CookieNotice";
import { MiniAppReady } from "@/components/MiniAppReady";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import { miniappEmbed, APP_ORIGIN } from "@/lib/miniapp";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Split expenses with friends without the fuss. Create a split, share the link and let everyone add what they paid — no accounts needed.";

export const metadata: Metadata = {
  metadataBase: new URL("https://split.xuper.fun"),
  title: {
    default: "Xupersplit — split shared expenses",
    template: "%s — Xupersplit",
  },
  description: DESCRIPTION,
  applicationName: "Xupersplit",
  keywords: [
    "split expenses",
    "expense splitter",
    "split bills",
    "settle up",
    "group expenses",
    "crypto payments",
    "USDC",
    "Swish",
  ],
  // The opengraph-image / twitter-image files attach the card automatically.
  openGraph: {
    type: "website",
    siteName: "Xupersplit",
    title: "Xupersplit — split shared expenses",
    description: DESCRIPTION,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xupersplit — split shared expenses",
    description: DESCRIPTION,
  },
  // Farcaster Mini App launch card (sharing split.xuper.fun opens the app).
  other: { "fc:miniapp": miniappEmbed(APP_ORIGIN) },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dict } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://split.xuper.fun/#org",
                  name: "Xupersplit",
                  url: "https://split.xuper.fun",
                  logo: "https://split.xuper.fun/apple-icon.png",
                  sameAs: ["https://github.com/kanylbullen/xupersplit"],
                },
                {
                  "@type": "WebApplication",
                  name: "Xupersplit",
                  url: "https://split.xuper.fun",
                  applicationCategory: "FinanceApplication",
                  operatingSystem: "Web",
                  description: DESCRIPTION,
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                  publisher: { "@id": "https://split.xuper.fun/#org" },
                },
              ],
            }),
          }}
        />
        <I18nProvider locale={locale} dict={dict}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <CookieNotice />
            <MiniAppReady />
            <Analytics />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
