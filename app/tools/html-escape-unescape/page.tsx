import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "HTML Escape Unescape – Encode & Decode HTML Entities | Yoryantra",

  description:
    "Escape and unescape HTML entities for safe text rendering, HTML content, frontend debugging, APIs, and web development workflows.",

  keywords: [
    "html escape unescape",
    "html entity encoder",
    "html entity decoder",
    "escape html",
    "unescape html",
    "html entities converter",
    "html encoder decoder",
    "encode html entities",
    "decode html entities",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/html-escape-unescape",
  },

  openGraph: {
    title:
      "HTML Escape Unescape – Encode & Decode HTML Entities | Yoryantra",

    description:
      "Escape and unescape HTML entities for safe rendering, frontend debugging, APIs, and web development workflows.",

    url: "https://yoryantra.com/tools/html-escape-unescape",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "HTML Escape Unescape – Encode & Decode HTML Entities | Yoryantra",

    description:
      "Free HTML Escape Unescape tool for encoding and decoding HTML entities safely.",
  },
};

export default function Page() {
  return <ToolClient />;
}
