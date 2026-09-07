import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Nginx Redirect Rule Tester | Return & Rewrite Preflight | Yoryantra",
  description:
    "Simulate common Nginx return and rewrite redirects against a URL, including server, location, status, target, and loop checks.",
  keywords: [
    "Nginx redirect rule tester",
    "Nginx rewrite tester",
    "Nginx redirect tester",
    "Nginx return 301 tester",
    "Nginx rewrite rule checker",
    "Nginx HTTP to HTTPS redirect",
    "Nginx server_name tester",
    "DevOps tools",
    "Nginx tools",
    "redirect tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/nginx-redirect-rule-tester",
  },
  openGraph: {
    title: "Nginx Redirect Rule Tester | Return & Rewrite Preflight | Yoryantra",
    description:
      "Simulate common Nginx return and rewrite redirects against a URL, including server, location, status, target, and loop checks.",
    url: "https://yoryantra.com/tools/nginx-redirect-rule-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nginx Redirect Rule Tester | Return & Rewrite Preflight | Yoryantra",
    description:
      "Simulate common Nginx return and rewrite redirects against a URL, including server, location, status, target, and loop checks.",
  },
};

export default function NginxRedirectRuleTesterPage() {
  return <ToolClient />;
}
