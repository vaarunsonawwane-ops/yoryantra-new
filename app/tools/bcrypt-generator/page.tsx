import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "bcrypt Generator — Cost Factor and 72-Byte Check | Yoryantra",
  description:
    "Create salted bcrypt hashes for testing, compare cost factors, see UTF-8 byte length, and understand bcrypt's 72-byte legacy constraint.",
  keywords: [
    "bcrypt generator",
    "bcrypt hash generator",
    "bcrypt cost factor",
    "bcrypt 72 byte limit",
    "bcrypt salt",
    "password hash testing",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/bcrypt-generator",
  },
  openGraph: {
    title: "bcrypt Generator — Cost Factor and 72-Byte Check | Yoryantra",
    description:
      "Generate salted bcrypt hashes for development while seeing cost and UTF-8 byte-limit behavior clearly.",
    url: "https://yoryantra.com/tools/bcrypt-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bcrypt Generator — Cost Factor and 72-Byte Check | Yoryantra",
    description:
      "Create test bcrypt hashes with selectable cost and a visible 72-byte UTF-8 safeguard.",
  },
};

export default function Page() {
  return <ToolClient />;
}
