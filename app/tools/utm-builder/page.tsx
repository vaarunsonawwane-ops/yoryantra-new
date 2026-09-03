import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "UTM Builder | Campaign URL Generator | Yoryantra",
  description:
    "Build Google Analytics campaign URLs with UTM parameters, preserve destination queries and fragments, review existing tags, and keep campaign names consistent.",
  alternates: {
    canonical: "https://yoryantra.com/tools/utm-builder",
  },
  openGraph: {
    title: "UTM Builder | Campaign URL Generator | Yoryantra",
    description:
      "Create campaign URLs without damaging existing query parameters, fragments, or previously tagged links.",
    url: "https://yoryantra.com/tools/utm-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UTM Builder | Yoryantra",
    description:
      "Build consistent Google Analytics campaign URLs while preserving the destination URL.",
  },
};

export default function Page() {
  return <ToolClient />;
}
