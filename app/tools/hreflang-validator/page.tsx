import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hreflang Validator | Check Hreflang Tags | Yoryantra",
  description:
    "Validate hreflang locale codes, x-default, alternate URLs, duplicate locale targets, and self-reference before publishing international pages.",
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
    title: "Hreflang Validator | Check Hreflang Tags | Yoryantra",
    description:
      "Validate hreflang locale codes, x-default, alternate URLs, duplicate locale targets, and self-reference before publishing international pages.",
    url: "https://yoryantra.com/tools/hreflang-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hreflang Validator | Check Hreflang Tags | Yoryantra",
    description:
      "Validate hreflang locale codes, x-default, alternate URLs, duplicate locale targets, and self-reference before publishing international pages.",
  },
};

export default function HreflangValidatorPage() {
  return <ToolClient />;
}
