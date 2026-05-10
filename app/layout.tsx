import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* strategyを beforeInteractive に変えて、真っ先にフォントを準備させる */}
        <Script
          src="https://use.typekit.net/pfq7ugp.js"
          strategy="beforeInteractive" 
        />
        <Script id="typekit-load" strategy="afterInteractive">
          {`
            try {
              Typekit.load({ async: true, kitId: 'pfq7ugp' });
            } catch (e) {
              console.error("Typekit load error", e);
            }
          `}
        </Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}