import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { Providers } from "./providers";
import { baseMetadata } from "./lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1064413653701203" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1064413653701203"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
