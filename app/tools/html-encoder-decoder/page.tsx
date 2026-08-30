import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTML Encoder Decoder | Character References | Yoryantra",
  description:
    "Encode text as named, decimal, or hexadecimal HTML character references and decode HTML entities for debugging, CMS content, and web data.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-encoder-decoder",
  },
  openGraph: {
    title: "HTML Encoder Decoder | Character References | Yoryantra",
    description:
      "Convert text to HTML character references or decode named and numeric HTML entities for debugging, CMS content, and web workflows.",
    url: "https://yoryantra.com/tools/html-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML Encoder Decoder | Character References | Yoryantra",
    description:
      "Encode or decode named, decimal, and hexadecimal HTML character references.",
  },
};

export default function Page() {
  return <ToolClient />;
}
