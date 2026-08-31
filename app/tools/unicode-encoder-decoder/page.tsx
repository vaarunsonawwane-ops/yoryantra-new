import ToolClient from "./ToolClient";

export const metadata = {
  title: "Unicode Encoder Decoder | JavaScript & JSON Escapes | Yoryantra",
  description:
    "Encode and decode Unicode as JavaScript code-point escapes, JSON-compatible UTF-16 escapes, or U+ code-point notation with surrogate-pair checks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/unicode-encoder-decoder",
  },
  openGraph: {
    title: "Unicode Encoder Decoder | JavaScript & JSON Escapes | Yoryantra",
    description:
      "Convert text between JavaScript Unicode escapes, JSON-compatible UTF-16 escapes, U+ code points, and readable Unicode text.",
    url: "https://yoryantra.com/tools/unicode-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unicode Encoder Decoder | JavaScript & JSON Escapes | Yoryantra",
    description:
      "Work with JavaScript code-point escapes, JSON UTF-16 escapes, Unicode code points, and readable text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
