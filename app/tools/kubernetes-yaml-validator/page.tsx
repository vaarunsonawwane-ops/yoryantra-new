import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes YAML Validator | Manifest Checker | Yoryantra",
  description:
    "Inspect Kubernetes YAML identity, selectors, Pod templates, containers, volumes, env sources, Secret data, API versions, Lists, and multi-document mistakes.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-yaml-validator",
  },
  openGraph: {
    title: "Kubernetes YAML Validator | Manifest Checker | Yoryantra",
    description:
      "Inspect Kubernetes manifest structure, workload relationships, env sources, Secret data, common API versions, and multi-document mistakes before cluster validation.",
    url: "https://yoryantra.com/tools/kubernetes-yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kubernetes YAML Validator | Yoryantra",
    description:
      "Inspect Kubernetes YAML structure, workload templates, selectors, containers, and common manifest mistakes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
