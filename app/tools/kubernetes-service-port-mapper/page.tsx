import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Service Port Mapper | Map K8s Service Ports Online | Yoryantra",
  description:
    "Map Kubernetes Service ports from pasted YAML. Review service type, port, targetPort, nodePort, selectors, container ports, ingress hosts, and exposure notes.",
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
    title: "Kubernetes Service Port Mapper | Map K8s Service Ports Online | Yoryantra",
    description:
      "Map Kubernetes Service ports from pasted YAML. Review service type, port, targetPort, nodePort, selectors, container ports, ingress hosts, and exposure notes.",
    url: "https://yoryantra.com/tools/kubernetes-service-port-mapper",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Service Port Mapper | Map K8s Service Ports Online | Yoryantra",
    description:
      "Map Kubernetes Service ports from pasted YAML. Review service type, port, targetPort, nodePort, selectors, container ports, ingress hosts, and exposure notes.",
  },
};

export default function KubernetesServicePortMapperPage() {
  return <ToolClient />;
}
