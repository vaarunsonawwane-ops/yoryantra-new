import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Ports Checker | Check Port Conflicts Online | Yoryantra",
  description:
    "Check Docker Compose ports, find duplicate host ports, invalid port mappings, protocol issues, ranges, exposed ports, and service port conflicts directly in your browser.",
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
    title: "Docker Compose Ports Checker | Check Port Conflicts Online | Yoryantra",
    description:
      "Check Docker Compose ports, find duplicate host ports, invalid port mappings, protocol issues, ranges, exposed ports, and service port conflicts directly in your browser.",
    url: "https://yoryantra.com/tools/docker-compose-ports-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Ports Checker | Check Port Conflicts Online | Yoryantra",
    description:
      "Check Docker Compose ports, find duplicate host ports, invalid port mappings, protocol issues, ranges, exposed ports, and service port conflicts directly in your browser.",
  },
};

export default function DockerComposePortsCheckerPage() {
  return <ToolClient />;
}
