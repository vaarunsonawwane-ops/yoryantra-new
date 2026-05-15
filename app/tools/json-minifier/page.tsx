import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Minifier Online Free | Yoryantra",

  description:
    "Minify and compress JSON data instantly with this free online JSON Minifier. Remove whitespace from JSON for APIs, apps, and development workflows.",

  keywords: [
    "json minifier",
    "minify json",
    "json compressor",
    "compress json online",
    "remove whitespace from json",
    "json tools",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-minifier",
  },

  openGraph: {
    title: "JSON Minifier Online Free | Yoryantra",

    description:
      "Minify and compress JSON data instantly with this free online JSON Minifier.",

    url: "https://yoryantra.com/tools/json-minifier",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Minifier Online Free | Yoryantra",

    description:
      "Compress JSON instantly with this clean and fast JSON Minifier.",
  },
};

export default function Page() {
  return <ToolClient />;
}