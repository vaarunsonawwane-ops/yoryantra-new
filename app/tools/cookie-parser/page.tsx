import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Parser | Read Cookie & Set-Cookie Headers | Yoryantra",
  description:
    "Parse Cookie and Set-Cookie headers, understand common cookie attributes, preserve duplicate names, and inspect Secure, HttpOnly, SameSite, prefixes, and expiry settings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-parser",
  },
  openGraph: {
    title: "Cookie Parser | Read Cookie & Set-Cookie Headers | Yoryantra",
    description:
      "Read browser cookie headers in plain language, then inspect attributes, duplicates, prefixes, and structural diagnostics.",
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
