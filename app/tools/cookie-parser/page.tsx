import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cookie Parser | Cookie & Set-Cookie Inspector | Yoryantra",
  description:
    "Parse Cookie request headers and Set-Cookie response headers while preserving duplicate names, attributes, raw values, and diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-parser",
  },
  openGraph: {
    title: "Cookie Parser | Cookie & Set-Cookie Inspector | Yoryantra",
    description:
      "Inspect Cookie and Set-Cookie headers with ordered values, attributes, and practical diagnostics.",
    url: "https://yoryantra.com/tools/cookie-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Parser | Cookie & Set-Cookie Inspector | Yoryantra",
    description:
      "Parse request cookies and Set-Cookie response headers without losing repeated values or attributes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
