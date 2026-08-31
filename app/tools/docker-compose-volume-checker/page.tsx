import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Volume Checker – Review Volume Mounts | Yoryantra",
  description:
    "Review Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket access, anonymous volumes, and writable config mounts.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-volume-checker",
  },
  openGraph: {
    title: "Docker Compose Volume Checker – Review Volume Mounts | Yoryantra",
    description:
    "Review Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket access, anonymous volumes, and writable config mounts.",
    url: "https://yoryantra.com/tools/docker-compose-volume-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Volume Checker – Review Volume Mounts | Yoryantra",
    description:
    "Review Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket access, anonymous volumes, and writable config mounts.",
  },
};

export default function DockerComposeVolumeCheckerPage() {
  return <ToolClient />;
}
