import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Service Dependency Visualizer | Yoryantra",
  description:
    "Map Compose depends_on conditions, namespace references, links, networks, ports, and inferred service connections from pasted YAML.",
  keywords: [
    "Docker Compose dependency graph",
    "depends_on visualizer",
    "Docker Compose Mermaid graph",
    "Compose service relationships",
    "Docker Compose YAML",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/docker-compose-service-dependency-visualizer" },
  openGraph: {
    title: "Docker Compose Service Dependency Visualizer | Yoryantra",
    description:
      "Map formal Compose dependencies separately from namespace references, links, networks, ports, and inferred connection hints.",
    url: "https://yoryantra.com/tools/docker-compose-service-dependency-visualizer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Service Dependency Visualizer | Yoryantra",
    description:
      "Map formal Compose dependencies separately from namespace references, links, networks, ports, and inferred connection hints.",
  },
};

export default function DockerComposeServiceDependencyVisualizerPage() {
  return <ToolClient />;
}
