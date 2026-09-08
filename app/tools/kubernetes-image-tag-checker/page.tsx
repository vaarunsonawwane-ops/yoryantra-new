import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Image Tag Checker | Tags, Digests & Pull Policy | Yoryantra",
  description:
    "Review Kubernetes workload image references for latest semantics, tags, digests, registry names, pull policies, init containers, and malformed image syntax.",
  keywords: [
    "Kubernetes Image Tag Checker",
    "K8s image tag checker",
    "Kubernetes container image checker",
    "Kubernetes latest tag checker",
    "Kubernetes image digest checker",
    "Kubernetes manifest image scanner",
    "K8s YAML image analyzer",
    "container image tag checker",
    "DevOps tools",
    "Kubernetes tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-image-tag-checker",
  },
  openGraph: {
    title: "Kubernetes Image Tag Checker | Tags, Digests & Pull Policy | Yoryantra",
    description:
      "Review Kubernetes workload image references for latest semantics, tags, digests, registry names, pull policies, init containers, and malformed image syntax.",
    url: "https://yoryantra.com/tools/kubernetes-image-tag-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Image Tag Checker | Tags, Digests & Pull Policy | Yoryantra",
    description:
      "Review Kubernetes workload image references for latest semantics, tags, digests, registry names, pull policies, init containers, and malformed image syntax.",
  },
};

export default function KubernetesImageTagCheckerPage() {
  return <ToolClient />;
}
