import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Data URI Generator | Percent and Base64 Data URLs | Yoryantra",
  description: "Build data URLs for SVG, text, HTML, CSS, and JSON with explicit media type, charset, percent encoding, or Base64 choices.",
  alternates: { canonical: "https://yoryantra.com/tools/data-uri-generator" },
  openGraph: { title: "Data URI Generator | Yoryantra", description: "Build standards-shaped data URLs with explicit media type, charset, and encoding choices.", url: "https://yoryantra.com/tools/data-uri-generator", siteName: "Yoryantra", type: "website" },
  twitter: { card: "summary", title: "Data URI Generator | Yoryantra", description: "Build data URLs with explicit media type, charset, percent encoding, or Base64 choices." },
};

export default function DataURIGeneratorPage() { return <ToolClient />; }
