import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hreflang Validator | Check Hreflang Tags for SEO Issues | Yoryantra",
  description:
    "Validate hreflang tags for international SEO. Check language codes, region codes, x-default, duplicate hreflang values, absolute URLs, self-reference, and common hreflang mistakes.",
  keywords: [
    "Hreflang Validator",
    "hreflang checker",
    "hreflang tag validator",
    "international SEO hreflang",
    "hreflang x-default checker",
    "hreflang language code checker",
    "alternate hreflang validator",
    "technical SEO tools",
    "SEO tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hreflang-validator",
  },
  openGraph: {
    title: "Hreflang Validator | Check Hreflang Tags for SEO Issues | Yoryantra",
    description:
      "Validate hreflang tags for international SEO. Check language codes, region codes, x-default, duplicate hreflang values, absolute URLs, self-reference, and common hreflang mistakes.",
    url: "https://yoryantra.com/tools/hreflang-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hreflang Validator | Check Hreflang Tags for SEO Issues | Yoryantra",
    description:
      "Validate hreflang tags for international SEO. Check language codes, region codes, x-default, duplicate hreflang values, absolute URLs, self-reference, and common hreflang mistakes.",
  },
};

export default function HreflangValidatorPage() {
  return <ToolClient />;
}
