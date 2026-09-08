import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Service Port Mapper | targetPort, NodePort & Ingress | Yoryantra",
  description:
    "Map Kubernetes Service ports to targetPorts, selected workload ports, NodePorts, headless or ExternalName behavior, and Ingress Service backends.",
  keywords: [
    "Kubernetes Service Port Mapper",
    "Kubernetes service ports",
    "K8s service port mapper",
    "Kubernetes targetPort checker",
    "Kubernetes nodePort checker",
    "Kubernetes service selector checker",
    "Kubernetes port mapping",
    "K8s Service YAML analyzer",
    "DevOps tools",
    "Kubernetes tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-service-port-mapper",
  },
  openGraph: {
    title: "Kubernetes Service Port Mapper | targetPort, NodePort & Ingress | Yoryantra",
    description:
      "Map Kubernetes Service ports to targetPorts, selected workload ports, NodePorts, headless or ExternalName behavior, and Ingress Service backends.",
    url: "https://yoryantra.com/tools/kubernetes-service-port-mapper",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Service Port Mapper | targetPort, NodePort & Ingress | Yoryantra",
    description:
      "Map Kubernetes Service ports to targetPorts, selected workload ports, NodePorts, headless or ExternalName behavior, and Ingress Service backends.",
  },
};

export default function KubernetesServicePortMapperPage() {
  return <ToolClient />;
}
