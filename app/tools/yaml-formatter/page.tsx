import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML Formatter Online | Format, Beautify, and Validate YAML",
  description:
    "Format YAML online, beautify indentation, validate YAML syntax, and clean YAML configuration files for Kubernetes, Docker Compose, CI/CD, and DevOps workflows.",
  keywords: [
    "yaml formatter",
    "yaml formatter online",
    "yaml format online",
    "format yaml online",
    "online yaml formatter",
    "yaml beautifier",
    "yaml validator",
    "pretty print yaml",
    "yaml indentation checker",
    "kubernetes yaml formatter",
    "docker compose yaml formatter",
    "ci cd yaml formatter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-formatter",
  },
  openGraph: {
    title: "YAML Formatter Online | Yoryantra",
    description:
      "Format, beautify, and validate YAML configuration files directly in your browser.",
    url: "https://yoryantra.com/tools/yaml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML Formatter Online | Yoryantra",
    description:
      "Format YAML online, validate syntax, and clean YAML indentation for configuration files.",
  },
};

export default function Page() {
  return <ToolClient />;
}
