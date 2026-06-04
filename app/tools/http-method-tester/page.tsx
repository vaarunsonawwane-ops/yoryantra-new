import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Method Tester | Check REST Method Usage and Request Examples",
  description:
    "Check HTTP method usage, build safe request examples, compare REST method behavior, and generate cURL or fetch snippets locally in your browser.",
  keywords: [
    "http method tester",
    "http method checker",
    "rest method tester",
    "http request method tool",
    "get post put patch delete checker",
    "http method reference",
    "api method tester",
    "curl method generator",
    "fetch request generator",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-method-tester",
  },
  openGraph: {
    title: "HTTP Method Tester | Yoryantra",
    description:
      "Check HTTP method usage, build cURL and fetch examples, and review REST method behavior without sending requests.",
    url: "https://yoryantra.com/tools/http-method-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Method Tester | Yoryantra",
    description:
      "Build safe HTTP method examples, compare REST method behavior, and generate request snippets locally.",
  },
};

export default function HttpMethodTesterPage() {
  return <ToolClient />;
}
