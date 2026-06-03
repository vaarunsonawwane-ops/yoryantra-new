import ToolClient from "./ToolClient";

export const metadata = {
  title: "Word Counter Online Free | Yoryantra",

  description:
    "Count words, characters, sentences, and estimated reading time instantly with this free online Word Counter. Fast and clean writing utility for content, SEO, and productivity workflows.",

  keywords: [
    "word counter",
    "character counter",
    "online word counter",
    "text statistics tool",
    "reading time calculator",
    "seo writing tools",
    "count words online",
    "writing productivity tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/word-counter",
  },

  openGraph: {
    title: "Word Counter Online Free | Yoryantra",

    description:
      "Free online Word Counter to count words, characters, and reading time instantly.",

    url: "https://yoryantra.com/tools/word-counter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Word Counter Online Free | Yoryantra",

    description:
      "Count words, characters, and reading time instantly with this clean online utility.",
  },
};

export default function Page() {
  return <ToolClient />;
}