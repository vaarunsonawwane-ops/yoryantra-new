import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Accept Header Generator | Build Accept and Content-Type Headers | Yoryantra",
  description:
    "Generate HTTP Accept, Accept-Language, Accept-Encoding, and Content-Type headers for API requests, browser testing, JSON APIs, XML APIs, file downloads, and content negotiation debugging.",
  keywords: [
    "HTTP Accept Header Generator",
    "Accept header generator",
    "Content-Type header generator",
    "Accept-Language header generator",
    "Accept-Encoding header generator",
    "HTTP content negotiation",
    "API headers generator",
    "HTTP request headers",
    "developer tools",
    "API testing tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-accept-header-generator",
  },
  openGraph: {
    title: "HTTP Accept Header Generator | Build Accept and Content-Type Headers | Yoryantra",
    description:
      "Generate HTTP Accept, Accept-Language, Accept-Encoding, and Content-Type headers for API requests, browser testing, JSON APIs, XML APIs, file downloads, and content negotiation debugging.",
    url: "https://yoryantra.com/tools/http-accept-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Accept Header Generator | Build Accept and Content-Type Headers | Yoryantra",
    description:
      "Generate HTTP Accept, Accept-Language, Accept-Encoding, and Content-Type headers for API requests, browser testing, JSON APIs, XML APIs, file downloads, and content negotiation debugging.",
  },
};

export default function HttpAcceptHeaderGeneratorPage() {
  return <ToolClient />;
}
