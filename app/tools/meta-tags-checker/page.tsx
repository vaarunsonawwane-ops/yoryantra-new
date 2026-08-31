import ToolClient from "./ToolClient";

export const metadata = {
  title: "Meta Tags Checker | Inspect SEO, Canonical & Social Tags | Yoryantra",
  description:
    "Inspect pasted HTML for title, meta description, robots, canonical, Open Graph, X/Twitter Card, charset, viewport, language, and duplicate metadata.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tags-checker",
  },
  openGraph: {
    title: "Meta Tags Checker | Inspect SEO, Canonical & Social Tags | Yoryantra",
    description:
      "Inspect HTML metadata without fetching a page: title, description, robots, canonical, Open Graph, social cards, and technical head tags.",
    url: "https://yoryantra.com/tools/meta-tags-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tags Checker | Inspect SEO, Canonical & Social Tags | Yoryantra",
    description:
      "Review pasted HTML for search metadata, canonical annotations, Open Graph, social-card tags, and duplicate declarations.",
  },
};

export default function Page() {
  return <ToolClient />;
}
