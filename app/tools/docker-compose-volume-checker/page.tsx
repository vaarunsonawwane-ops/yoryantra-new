import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Volume Checker | Check Compose Volume Mounts Online | Yoryantra",
  description:
    "Check Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket mounts, anonymous volumes, missing modes, read-only recommendations, and data-loss risks.",
  keywords: [
    "Docker Compose Volume Checker",
    "docker compose volumes checker",
    "Docker volume mount checker",
    "compose volume validator",
    "Docker bind mount checker",
    "Docker socket mount checker",
    "docker-compose volume checker",
    "DevOps tools",
    "Docker tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-volume-checker",
  },
  openGraph: {
    title: "Docker Compose Volume Checker | Check Compose Volume Mounts Online | Yoryantra",
    description:
      "Check Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket mounts, anonymous volumes, missing modes, read-only recommendations, and data-loss risks.",
    url: "https://yoryantra.com/tools/docker-compose-volume-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Volume Checker | Check Compose Volume Mounts Online | Yoryantra",
    description:
      "Check Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket mounts, anonymous volumes, missing modes, read-only recommendations, and data-loss risks.",
  },
};

export default function DockerComposeVolumeCheckerPage() {
  return <ToolClient />;
}
