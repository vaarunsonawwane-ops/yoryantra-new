import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    icon: "/YoryantraFavicon.png",
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
      </body>
    </html>
  );
}