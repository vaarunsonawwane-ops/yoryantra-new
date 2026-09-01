import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: ".env File Parser | Inspect Environment Variables | Yoryantra",
  description:
    "Parse Node-style .env text, inspect quotes, comments, multiline values and duplicates, compare effective values, and mask likely secrets in visible output.",
  alternates: {
    canonical: "https://yoryantra.com/tools/env-file-parser",
  },
  openGraph: {
    title: ".env File Parser | Inspect Environment Variables | Yoryantra",
    description:
      "Inspect dotenv assignments in source order, spot duplicate variables, understand quoting and comments, and mask likely secrets.",
    url: "https://yoryantra.com/tools/env-file-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: ".env File Parser | Yoryantra",
    description:
      "Parse Node-style .env content with duplicate warnings, quoted-value handling, and optional secret masking.",
  },
};

export default function Page() {
  return <ToolClient />;
}
