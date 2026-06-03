import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Resource Calculator | Calculate CPU and Memory Requests | Yoryantra",
  description:
    "Calculate Kubernetes CPU and memory requests, limits, container totals, pod totals, and workload resource usage from YAML directly in your browser.",
  keywords: [
    "Kubernetes resource calculator",
    "Kubernetes CPU memory calculator",
    "Kubernetes requests limits calculator",
    "Kubernetes resource requests",
    "Kubernetes resource limits",
    "Kubernetes YAML resource calculator",
    "K8s resource calculator",
    "DevOps tools",
    "Kubernetes tools",
    "YAML tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-resource-calculator",
  },
  openGraph: {
    title: "Kubernetes Resource Calculator | Calculate CPU and Memory Requests | Yoryantra",
    description:
      "Calculate Kubernetes CPU and memory requests, limits, container totals, pod totals, and workload resource usage from YAML directly in your browser.",
    url: "https://yoryantra.com/tools/kubernetes-resource-calculator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Resource Calculator | Calculate CPU and Memory Requests | Yoryantra",
    description:
      "Calculate Kubernetes CPU and memory requests, limits, container totals, pod totals, and workload resource usage from YAML directly in your browser.",
  },
};

export default function KubernetesResourceCalculatorPage() {
  return <ToolClient />;
}
