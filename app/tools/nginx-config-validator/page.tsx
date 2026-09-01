import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Nginx Config Validator | Syntax & Context Review | Yoryantra",
  description:
    "Inspect Nginx config for braces, semicolons, contexts, includes, proxy/TLS/header patterns, duplicate directives, and deployment risks before nginx -t.",
  alternates: {
    canonical: "https://yoryantra.com/tools/nginx-config-validator",
  },
  openGraph: {
    title: "Nginx Config Validator | Yoryantra",
    description:
      "Review Nginx source structure and common configuration mistakes while keeping nginx -t, installed modules, include files, paths, certificates, and runtime behavior outside the browser tool's claims.",
    url: "https://yoryantra.com/tools/nginx-config-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Nginx Config Validator | Yoryantra",
    description:
      "Inspect Nginx configuration structure and practical risk patterns before testing the real configuration with nginx -t.",
  },
};

export default function Page() {
  return <ToolClient />;
}
