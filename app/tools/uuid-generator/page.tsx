import ToolClient from "./ToolClient";

export const metadata = {
  title: "UUID Generator Online Free | Yoryantra",

  description:
    "Generate random UUID v4 values instantly with this free online UUID Generator. Fast, secure, and browser-based UUID generation tool.",

  keywords: [
    "uuid generator",
    "uuid v4 generator",
    "generate uuid",
    "random uuid",
    "uuid online",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/uuid-generator",
  },

  openGraph: {
    title: "UUID Generator Online Free | Yoryantra",

    description:
      "Generate random UUID v4 identifiers instantly with this free online UUID Generator.",

    url: "https://yoryantra.com/tools/uuid-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "UUID Generator Online Free | Yoryantra",

    description:
      "Generate secure UUID v4 values instantly with this clean and fast UUID Generator.",
  },
};

export default function Page() {
  return <ToolClient />;
}