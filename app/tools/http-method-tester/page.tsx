import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Method Tester | Method Semantics and Request Examples",
  description:
    "Compare GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS semantics, then build cURL or fetch request examples without sending them.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-method-tester",
  },
  openGraph: {
    title: "HTTP Method Tester | Yoryantra",
    description:
      "Compare HTTP method semantics and build cURL or fetch request examples without sending requests.",
    url: "https://yoryantra.com/tools/http-method-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Method Tester | Yoryantra",
    description:
      "Compare HTTP method semantics and build request snippets locally without contacting an endpoint.",
  },
};

export default function HttpMethodTesterPage() {
  return <ToolClient />;
}
