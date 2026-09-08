import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Resource Requests & Limits Checker | CPU Memory Review | Yoryantra",
  description:
    "Check Kubernetes YAML for container and Pod-level CPU or memory requests, limits, quantity errors, missing declarations, and request-limit conflicts.",
  keywords: [
    "Kubernetes resource requests limits checker",
    "Kubernetes CPU memory requests",
    "Kubernetes resource limits",
    "Kubernetes Pod level resources",
    "Kubernetes resource quantity checker",
    "Kubernetes LimitRange requests limits",
    "K8s manifest resource review",
    "Kubernetes init container resources",
    "DevOps tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-resource-requests-limits-checker",
  },
  openGraph: {
    title: "Kubernetes Resource Requests & Limits Checker | Yoryantra",
    description:
      "Review container and Pod-level resource declarations, Kubernetes quantities, missing fields, and request-limit conflicts.",
    url: "https://yoryantra.com/tools/kubernetes-resource-requests-limits-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kubernetes Resource Requests & Limits Checker | Yoryantra",
    description:
      "Review Kubernetes CPU and memory requests, limits, Pod-level budgets, quantity errors, and static manifest gaps.",
  },
};

export default function KubernetesResourceRequestsLimitsCheckerPage() {
  return <ToolClient />;
}
