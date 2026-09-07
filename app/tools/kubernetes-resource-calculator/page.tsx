import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Resource Calculator | CPU & Memory Totals | Yoryantra",
  description:
    "Calculate declared Kubernetes CPU and memory requests and limits across supported workloads, containers, and Deployment or StatefulSet replicas.",
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
    title: "Kubernetes Resource Calculator | CPU & Memory Totals | Yoryantra",
    description:
      "Calculate declared Kubernetes CPU and memory requests and limits across supported workloads, containers, and Deployment or StatefulSet replicas.",
    url: "https://yoryantra.com/tools/kubernetes-resource-calculator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Resource Calculator | CPU & Memory Totals | Yoryantra",
    description:
      "Calculate declared Kubernetes CPU and memory requests and limits across supported workloads, containers, and Deployment or StatefulSet replicas.",
  },
};

export default function KubernetesResourceCalculatorPage() {
  return <ToolClient />;
}
