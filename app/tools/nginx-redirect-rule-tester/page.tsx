import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Nginx Redirect Rule Tester | Test Rewrite and Return Rules | Yoryantra",
  description:
    "Test Nginx redirect rules, rewrite rules, return 301 and 302 redirects, HTTP to HTTPS redirects, server_name matches, and possible redirect loops directly in your browser.",
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
    title: "Nginx Redirect Rule Tester | Test Rewrite and Return Rules | Yoryantra",
    description:
      "Test Nginx redirect rules, rewrite rules, return 301 and 302 redirects, HTTP to HTTPS redirects, server_name matches, and possible redirect loops directly in your browser.",
    url: "https://yoryantra.com/tools/nginx-redirect-rule-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nginx Redirect Rule Tester | Test Rewrite and Return Rules | Yoryantra",
    description:
      "Test Nginx redirect rules, rewrite rules, return 301 and 302 redirects, HTTP to HTTPS redirects, server_name matches, and possible redirect loops directly in your browser.",
  },
};

export default function NginxRedirectRuleTesterPage() {
  return <ToolClient />;
}
