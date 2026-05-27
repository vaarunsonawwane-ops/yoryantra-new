import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yoryantra.com"),

  title: "YORYANTRA",

  description:
    "Smart utilities for structured workflows, productivity, and modern work.",

icons: {
  icon: "/YoryantraFavicon.ico",
  shortcut: "/YoryantraFavicon.ico",
  apple: "/YoryantraFavicon.ico",
},

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <Header />

        <main>{children}</main>

        <Footer />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V1ZXR0B4FM"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-V1ZXR0B4FM');
          `}
        </Script>
      </body>
    </html>
  );
}