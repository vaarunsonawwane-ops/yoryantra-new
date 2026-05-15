import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Diff Checker Online Free | Yoryantra",

  description:
    "Compare two JSON objects and find differences instantly with this free online JSON Diff Checker.",

  keywords: [
    "json diff checker",
    "compare json",
    "json compare tool",
    "json difference checker",
    "json comparison tool",
    "json diff viewer",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-diff-checker",
  },

  openGraph: {
    title:
      "JSON Diff Checker Online Free | Yoryantra",

    description:
      "Compare two JSON objects and find differences instantly online.",

    url:
      "https://yoryantra.com/tools/json-diff-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON Diff Checker Online Free | Yoryantra",

    description:
      "Compare two JSON objects and detect differences instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}