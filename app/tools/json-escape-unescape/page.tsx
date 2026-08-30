import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Escape Unescape | JSON String Escaper | Yoryantra",
  description:
    "Escape text as a JSON string or decode quoted JSON string literals and escaped contents with correct handling for quotes, backslashes, control characters, and Unicode.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-escape-unescape",
  },
  openGraph: {
    title: "JSON Escape Unescape | JSON String Escaper | Yoryantra",
    description:
      "Escape raw text as JSON string syntax or decode JSON string literals and escaped contents in your browser.",
    url: "https://yoryantra.com/tools/json-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Escape Unescape | Yoryantra",
    description:
      "Escape and unescape JSON string syntax with quoted-literal and contents-only modes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
