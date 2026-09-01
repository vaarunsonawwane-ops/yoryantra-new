import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Validator | Check Compose YAML | Yoryantra",
  description:
    "Check Docker Compose YAML for syntax, service structure, references, interpolation clues, named resources, and risky host-level settings before running Compose.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-validator",
  },
  openGraph: {
    title: "Docker Compose Validator | Check Compose YAML | Yoryantra",
    description:
      "Inspect Compose YAML structure, service references, named resources, interpolation clues, and configuration risks before using Docker Compose.",
    url: "https://yoryantra.com/tools/docker-compose-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Docker Compose Validator | Yoryantra",
    description:
      "Check Compose YAML structure and common configuration mistakes before running Docker Compose.",
  },
};

export default function Page() {
  return <ToolClient />;
}
