import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Validator | Check Compose YAML | Yoryantra",
  description:
    "Inspect Docker Compose YAML syntax, service structure, local references, interpolation clues, named resources, profiles, includes, and host-facing settings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-validator",
  },
  openGraph: {
    title: "Docker Compose Validator | Check Compose YAML | Yoryantra",
    description:
      "Inspect Compose YAML structure, local references, interpolation clues, named resources, profiles, includes, and host-facing configuration before Docker Compose resolves it.",
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
