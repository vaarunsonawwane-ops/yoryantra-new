import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Environment Variable Checker | Check Docker .env and Compose Env | Yoryantra",
  description:
    "Check Docker environment variables from .env files and docker-compose.yml snippets. Find missing values, duplicate keys, invalid names, empty variables, quoted values, and risky secrets exposure.",
  keywords: [
    "Docker Environment Variable Checker",
    "Docker env checker",
    "docker compose environment checker",
    "Docker .env checker",
    "environment variable validator",
    "docker compose env validator",
    "check missing environment variables",
    "DevOps tools",
    "Docker tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-environment-variable-checker",
  },
  openGraph: {
    title: "Docker Environment Variable Checker | Check Docker .env and Compose Env | Yoryantra",
    description:
      "Check Docker environment variables from .env files and docker-compose.yml snippets. Find missing values, duplicate keys, invalid names, empty variables, quoted values, and risky secrets exposure.",
    url: "https://yoryantra.com/tools/docker-environment-variable-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Environment Variable Checker | Check Docker .env and Compose Env | Yoryantra",
    description:
      "Check Docker environment variables from .env files and docker-compose.yml snippets. Find missing values, duplicate keys, invalid names, empty variables, quoted values, and risky secrets exposure.",
  },
};

export default function DockerEnvironmentVariableCheckerPage() {
  return <ToolClient />;
}
