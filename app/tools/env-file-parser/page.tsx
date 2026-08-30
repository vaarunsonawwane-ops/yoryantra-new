import ToolClient from "./ToolClient";

export const metadata = {
  title: ".env File Parser | Inspect Environment Variables Safely",
  description:
    "Parse Node-style .env text with quoted and multiline values, comments, export prefixes, duplicate-key warnings, and optional masking for likely secrets.",
  alternates: {
    canonical: "https://yoryantra.com/tools/env-file-parser",
  },
  openGraph: {
    title: ".env File Parser | Inspect Environment Variables Safely",
    description:
      "Inspect Node-style dotenv entries, duplicates, comments, multiline quoted values, and likely secrets locally in your browser.",
    url: "https://yoryantra.com/tools/env-file-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ".env File Parser | Inspect Environment Variables Safely",
    description:
      "Parse Node-style .env content with diagnostics and optional secret masking.",
  },
};

export default function Page() {
  return <ToolClient />;
}
