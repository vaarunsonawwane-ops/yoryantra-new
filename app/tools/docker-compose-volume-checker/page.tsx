import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Volume Checker | Mount Review | Yoryantra",
  description:
    "Parse Docker Compose YAML and review bind mounts, named volumes, anonymous mounts, Docker socket access, duplicate targets, read-only usage and volume declarations.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-volume-checker",
  },
  openGraph: {
    title: "Docker Compose Volume Checker | Yoryantra",
    description:
      "Review Compose volume mounts with YAML-aware parsing, duplicate-target detection, risky bind paths and named-volume declaration checks.",
    url: "https://yoryantra.com/tools/docker-compose-volume-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Docker Compose Volume Checker | Yoryantra",
    description:
      "Inspect Docker Compose volume mounts, bind paths, named volumes, duplicate targets and read-only settings locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
