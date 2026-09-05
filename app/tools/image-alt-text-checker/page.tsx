import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Image Alt Text Checker | Review Alt Attributes | Yoryantra",
  description:
    "Review image alt attributes in pasted HTML, including missing and empty alternatives, repeated wording, filename-like text, dimensions, and loading hints.",
  keywords: [
    "Image Alt Text Checker",
    "alt text checker",
    "missing alt attribute checker",
    "image SEO checker",
    "HTML image alt checker",
    "accessibility alt text checker",
    "image alt attribute tool",
    "technical SEO tools",
    "SEO tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/image-alt-text-checker",
  },
  openGraph: {
    title: "Image Alt Text Checker | Review Alt Attributes | Yoryantra",
    description:
      "Review image alt attributes in pasted HTML, including missing and empty alternatives, repeated wording, filename-like text, dimensions, and loading hints.",
    url: "https://yoryantra.com/tools/image-alt-text-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Alt Text Checker | Review Alt Attributes | Yoryantra",
    description:
      "Review image alt attributes in pasted HTML, including missing and empty alternatives, repeated wording, filename-like text, dimensions, and loading hints.",
  },
};

export default function ImageAltTextCheckerPage() {
  return <ToolClient />;
}
