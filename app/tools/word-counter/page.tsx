import ToolClient from "./ToolClient";

export const metadata = {
  title: "Word Counter with Unicode Text Statistics | Yoryantra",
  description:
    "Count locale-aware words, grapheme characters, sentences, characters without whitespace, and estimated reading time in the browser.",
  keywords: [
    "word counter",
    "character counter",
    "Unicode character counter",
    "sentence counter",
    "reading time estimate",
    "Intl Segmenter word count",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/word-counter",
  },
  openGraph: {
    title: "Word Counter with Unicode Text Statistics | Yoryantra",
    description:
      "Count locale-aware words, visible characters, sentences, and estimated reading time with browser text segmentation.",
    url: "https://yoryantra.com/tools/word-counter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Counter with Unicode Text Statistics | Yoryantra",
    description:
      "Count words, grapheme characters, sentences, and estimated reading time with locale-aware browser segmentation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
