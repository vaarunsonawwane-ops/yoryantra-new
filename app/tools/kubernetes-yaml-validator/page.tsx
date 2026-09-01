import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes YAML Validator | Manifest Checker | Yoryantra",
  description:
    "Inspect Kubernetes YAML for object identity, workload templates, containers, selectors, labels, env values, common API versions, Lists, and multi-document mistakes.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-yaml-validator",
  },
  openGraph: {
    title: "Kubernetes YAML Validator | Manifest Checker | Yoryantra",
    description:
      "Check Kubernetes manifest structure and common workload mistakes before cluster-aware kubectl validation.",
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
