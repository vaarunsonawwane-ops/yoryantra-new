import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Content-Disposition Header Generator | File Download Header Builder | Yoryantra",
  description:
    "Generate Content-Disposition headers for file downloads and inline previews. Build attachment and inline headers with safe filenames, UTF-8 filename*, ASCII fallback, and server snippets.",
  keywords: [
    "Content-Disposition Header Generator",
    "Content-Disposition generator",
    "file download header generator",
    "attachment header generator",
    "inline Content-Disposition",
    "filename star generator",
    "RFC 5987 filename",
    "HTTP download header",
    "developer tools",
    "API response header generator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/content-disposition-header-generator",
  },
  openGraph: {
    title: "Content-Disposition Header Generator | File Download Header Builder | Yoryantra",
    description:
      "Generate Content-Disposition headers for file downloads and inline previews. Build attachment and inline headers with safe filenames, UTF-8 filename*, ASCII fallback, and server snippets.",
    url: "https://yoryantra.com/tools/content-disposition-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Content-Disposition Header Generator | File Download Header Builder | Yoryantra",
    description:
      "Generate Content-Disposition headers for file downloads and inline previews. Build attachment and inline headers with safe filenames, UTF-8 filename*, ASCII fallback, and server snippets.",
  },
};

export default function ContentDispositionHeaderGeneratorPage() {
  return <ToolClient />;
}
