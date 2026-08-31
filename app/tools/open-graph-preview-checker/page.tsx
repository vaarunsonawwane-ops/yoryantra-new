import ToolClient from "./ToolClient";

export const metadata = {
  title: "Open Graph Preview Checker | Inspect Social Metadata | Yoryantra",
  description:
    "Inspect Open Graph and X card tags from pasted HTML, find duplicate or missing metadata, validate URLs, and preview likely sharing content.",
  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-preview-checker",
  },
  openGraph: {
    title: "Open Graph Preview Checker | Inspect Social Metadata | Yoryantra",
    description:
      "Inspect Open Graph and X card tags from pasted HTML, find duplicate or missing metadata, validate URLs, and preview likely sharing content.",
    url: "https://yoryantra.com/tools/open-graph-preview-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Graph Preview Checker | Inspect Social Metadata | Yoryantra",
    description:
      "Inspect Open Graph and X card tags from pasted HTML, find duplicate or missing metadata, validate URLs, and preview likely sharing content.",
  },
};

export default function Page() {
  return <ToolClient />;
}
