import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Ports Checker | Port Mapping Conflicts | Yoryantra",
  description:
    "Review Docker Compose port publishing, ranges, protocols, host bindings, expose entries, and conflicts before deployment.",
  keywords: [
    "Docker Compose ports checker",
    "Docker Compose port conflict checker",
    "Docker Compose ports validator",
    "Docker compose port mapping checker",
    "Docker ports checker",
    "docker-compose ports",
    "Docker Compose YAML ports",
    "container port conflict checker",
    "DevOps tools",
    "Docker tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-ports-checker",
  },
  openGraph: {
    title: "Docker Compose Ports Checker | Port Mapping Conflicts | Yoryantra",
    description:
      "Review Docker Compose port publishing, ranges, protocols, host bindings, expose entries, and conflicts before deployment.",
    url: "https://yoryantra.com/tools/docker-compose-ports-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Ports Checker | Port Mapping Conflicts | Yoryantra",
    description:
      "Review Docker Compose port publishing, ranges, protocols, host bindings, expose entries, and conflicts before deployment.",
  },
};

export default function DockerComposePortsCheckerPage() {
  return <ToolClient />;
}
