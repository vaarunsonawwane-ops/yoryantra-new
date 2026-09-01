import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Parser | Read Cookie & Set-Cookie Headers | Yoryantra",
  description:
    "Parse Cookie and Set-Cookie headers, preserve duplicate names, inspect common attributes, and understand Secure, HttpOnly, SameSite, prefixes, expiry, and browser behavior.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-parser",
  },
  openGraph: {
    title: "Cookie Parser | Read Cookie & Set-Cookie Headers | Yoryantra",
    description:
      "Read browser cookie headers in plain language, then inspect attributes, duplicates, prefixes, expiry, and common security diagnostics.",
    url: "https://yoryantra.com/tools/cookie-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cookie Parser | Yoryantra",
    description:
      "Parse Cookie and Set-Cookie headers and understand what their values and attributes mean.",
  },
};

export default function Page() {
  return <ToolClient />;
}
