import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Parser | Cookie & Set-Cookie Headers | Yoryantra",
  description:
    "Parse Cookie and Set-Cookie header text while preserving duplicate names, raw values and attributes, with checks for SameSite, Secure, HttpOnly, prefixes and expiry.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-parser",
  },
  openGraph: {
    title: "Cookie Parser | Cookie & Set-Cookie Headers | Yoryantra",
    description:
      "Read Cookie and Set-Cookie fields while keeping duplicates, raw values, attributes, prefixes, expiry, and security-relevant details visible.",
    url: "https://yoryantra.com/tools/cookie-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cookie Parser | Yoryantra",
    description:
      "Read Cookie and Set-Cookie fields, duplicate names, attributes, prefixes, and expiry details.",
  },
};

export default function Page() {
  return <ToolClient />;
}
