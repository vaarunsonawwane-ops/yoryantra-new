import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Redirect Checker | HTTP Redirect Chain Review | Yoryantra",
  description:
    "Review pasted HTTP response headers to trace Location hops, resolve relative redirects, spot loops or HTTPS downgrades, and understand 300/301/302/303/307/308 method behavior.",
  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-checker",
  },
  openGraph: {
    title: "Redirect Checker | Yoryantra",
    description:
      "Trace HTTP redirect chains from pasted response headers, including relative Location values, loops, protocol changes and request-method semantics.",
    url: "https://yoryantra.com/tools/redirect-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Redirect Checker | Yoryantra",
    description:
      "Review redirect statuses, Location hops, loops, HTTPS downgrades and request-method semantics from pasted HTTP headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
