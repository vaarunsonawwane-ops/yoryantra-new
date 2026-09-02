import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTML Entity Encoder & Decoder | Yoryantra",
  description:
    "Encode reserved HTML characters, optionally convert non-ASCII text to numeric character references, and decode named or numeric HTML entities in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-encoder-decoder",
  },
  openGraph: {
    title: "HTML Entity Encoder & Decoder | Yoryantra",
    description:
      "Encode HTML character references and decode named, decimal, or hexadecimal entities with practical guidance on escaping and sanitization boundaries.",
    url: "https://yoryantra.com/tools/html-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML Entity Encoder & Decoder | Yoryantra",
    description:
      "Encode and decode HTML character references with Unicode-aware browser-side processing.",
  },
};

export default function Page() {
  return <ToolClient />;
}
