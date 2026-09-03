import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTML Entity Encoder Decoder | Character References | Yoryantra",
  description:
    "Encode reserved HTML characters, convert Unicode to numeric references when needed, and decode named or numeric character references with clear security limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-encoder-decoder",
  },
  openGraph: {
    title: "HTML Entity Encoder Decoder | Character References | Yoryantra",
    description:
      "Encode reserved HTML characters and decode named, decimal, or hexadecimal character references, with clear notes on output context, double encoding, and sanitization limits.",
    url: "https://yoryantra.com/tools/html-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML Entity Encoder Decoder | Character References | Yoryantra",
    description:
      "Encode or decode HTML character references in the browser, including Unicode numeric references and legacy parsing caveats.",
  },
};

export default function Page() {
  return <ToolClient />;
}
