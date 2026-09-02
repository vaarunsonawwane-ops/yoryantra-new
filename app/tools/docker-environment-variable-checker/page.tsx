import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Environment Variable Checker | Compose & .env | Yoryantra",
  description:
    "Review Compose environment blocks and .env text for duplicates, empty or unresolved values, interpolation, env_file ordering, and secret-like variables.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-environment-variable-checker",
  },
  openGraph: {
    title: "Docker Environment Variable Checker | Yoryantra",
    description:
      "Inspect Compose environment map/list syntax or .env text while keeping interpolation, env_file and final Docker Compose resolution boundaries explicit.",
    url: "https://yoryantra.com/tools/docker-environment-variable-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Docker Environment Variable Checker | Yoryantra",
    description:
      "Check Docker Compose and .env variables for duplicates, unresolved values, interpolation and secret-handling risks.",
  },
};

export default function Page() {
  return <ToolClient />;
}
