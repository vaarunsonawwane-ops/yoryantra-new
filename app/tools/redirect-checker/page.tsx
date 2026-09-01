import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Redirect Checker | HTTP Chain Diagnostics | Yoryantra",
  description:
    "Analyze pasted HTTP redirect responses, resolve relative Location headers, detect loops, downgrades, multiple destinations, long chains and method-sensitive redirects.",
  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-checker",
  },
  openGraph: {
    title: "Redirect Checker | Yoryantra",
    description:
      "Inspect HTTP redirect chains from real response headers without pretending a browser-only URL check is a live redirect test.",
    url: "https://yoryantra.com/tools/redirect-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Redirect Checker | Yoryantra",
    description:
      "Review redirect statuses, Location hops, loops, protocol downgrades and request-method semantics from pasted HTTP headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
