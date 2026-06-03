import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Service Dependency Visualizer | Compose depends_on Graph | Yoryantra",
  description:
    "Visualize Docker Compose service dependencies from pasted compose YAML. Extract services, depends_on, links, ports, networks, and generate Mermaid graphs, summaries, JSON, Markdown, CSV, and checklists.",
  keywords: [
    "Docker Compose Service Dependency Visualizer",
    "docker compose depends_on graph",
    "docker compose dependency graph",
    "compose service visualizer",
    "docker compose services parser",
    "docker compose mermaid graph",
    "docker compose dependency checker",
    "DevOps tools",
    "Docker Compose tools",
    "YAML DevOps tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-service-dependency-visualizer",
  },
  openGraph: {
    title: "Docker Compose Service Dependency Visualizer | Compose depends_on Graph | Yoryantra",
    description:
      "Visualize Docker Compose service dependencies from pasted compose YAML. Extract services, depends_on, links, ports, networks, and generate Mermaid graphs, summaries, JSON, Markdown, CSV, and checklists.",
    url: "https://yoryantra.com/tools/docker-compose-service-dependency-visualizer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Service Dependency Visualizer | Compose depends_on Graph | Yoryantra",
    description:
      "Visualize Docker Compose service dependencies from pasted compose YAML. Extract services, depends_on, links, ports, networks, and generate Mermaid graphs, summaries, JSON, Markdown, CSV, and checklists.",
  },
};

export default function DockerComposeServiceDependencyVisualizerPage() {
  return <ToolClient />;
}
