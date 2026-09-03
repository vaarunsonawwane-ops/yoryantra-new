import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: ".env File Parser | Inspect Environment Variables | Yoryantra",
  description:
    "Parse Node-style .env text in source order, inspect quoting, comments, multiline values and duplicates, compare effective values, and mask likely credentials.",
  alternates: {
    canonical: "https://yoryantra.com/tools/env-file-parser",
  },
  openGraph: {
    title: ".env File Parser | Inspect Environment Variables | Yoryantra",
    description:
      "Inspect Node-style dotenv assignments in source order, including quoting, comments, multiline values, duplicate names, effective values, and optional credential masking.",
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
