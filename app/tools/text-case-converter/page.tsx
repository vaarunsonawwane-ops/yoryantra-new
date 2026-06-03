import ToolClient from "./ToolClient";

export const metadata = {
  title: "Text Case Converter Online Free | Yoryantra",

  description:
    "Convert text to uppercase, lowercase, title case, and sentence case instantly with this free online Text Case Converter. Clean and fast text formatting utility for writing and productivity workflows.",

  keywords: [
    "text case converter",
    "uppercase converter",
    "lowercase converter",
    "title case converter",
    "sentence case converter",
    "change text case",
    "text formatter",
    "online text tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/text-case-converter",
  },

  openGraph: {
    title: "Text Case Converter Online Free | Yoryantra",

    description:
      "Convert text instantly between uppercase, lowercase, title case, and sentence case.",

    url: "https://yoryantra.com/tools/text-case-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Text Case Converter Online Free | Yoryantra",

    description:
      "Free online Text Case Converter for formatting and transforming text instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}