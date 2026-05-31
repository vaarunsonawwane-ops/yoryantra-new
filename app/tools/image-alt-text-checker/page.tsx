import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Image Alt Text Checker | Check Missing Alt Attributes Online | Yoryantra",
  description:
    "Check image alt text from HTML. Find missing alt attributes, empty alt text, long alt text, duplicate alt text, file-name-like alt text, lazy loading, dimensions, and image SEO issues.",
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
    title: "Image Alt Text Checker | Check Missing Alt Attributes Online | Yoryantra",
    description:
      "Check image alt text from HTML. Find missing alt attributes, empty alt text, long alt text, duplicate alt text, file-name-like alt text, lazy loading, dimensions, and image SEO issues.",
    url: "https://yoryantra.com/tools/image-alt-text-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Alt Text Checker | Check Missing Alt Attributes Online | Yoryantra",
    description:
      "Check image alt text from HTML. Find missing alt attributes, empty alt text, long alt text, duplicate alt text, file-name-like alt text, lazy loading, dimensions, and image SEO issues.",
  },
};

export default function ImageAltTextCheckerPage() {
  return <ToolClient />;
}
