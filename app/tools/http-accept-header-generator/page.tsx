import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Accept Header Generator | Yoryantra",
  description:
    "Build Accept, Content-Type, Accept-Language, and Accept-Encoding headers with q-value checks, language ranges, media types, and browser Fetch limits.",
  keywords: [
    "HTTP Accept Header Generator",
    "Accept header generator",
    "Content-Type header generator",
    "Accept-Language generator",
    "Accept-Encoding generator",
    "HTTP content negotiation",
    "q value validator",
    "media type headers",
    "developer tools",
    "API request headers",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-accept-header-generator",
  },
  openGraph: {
    title: "HTTP Accept Header Generator | Yoryantra",
    description:
      "Build Accept, Content-Type, Accept-Language, and Accept-Encoding headers with q-value checks, language ranges, media types, and browser Fetch limits.",
    url: "https://yoryantra.com/tools/http-accept-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Accept Header Generator | Yoryantra",
    description:
      "Build Accept, Content-Type, Accept-Language, and Accept-Encoding headers with q-value checks, language ranges, media types, and browser Fetch limits.",
  },
};

export default function HttpAcceptHeaderGeneratorPage() {
  return <ToolClient />;
}
