import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Volume Checker | Mount Review | Yoryantra",
  description:
    "Review Docker Compose bind mounts, named volumes, socket exposure, duplicate targets, read-only settings, and top-level volume declarations from parsed YAML.",
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
