import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Environment Variable Resolver | Preview Compose Variables",
  description:
    "Resolve Docker Compose environment variable placeholders, preview .env substitutions, inspect defaults, and find missing variables locally in your browser.",
  keywords: [
    "docker compose environment variable resolver",
    "docker compose env resolver",
    "compose variable substitution",
    "docker compose env file checker",
    "docker compose environment preview",
    "docker compose variable checker",
    "docker compose config helper",
    "docker env interpolation",
    "devops tools",
    "browser docker compose tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-environment-variable-resolver",
  },
  openGraph: {
    title: "Docker Compose Environment Variable Resolver | Yoryantra",
    description:
      "Preview Docker Compose variable substitutions, inspect .env values, defaults, and missing variables without running Docker.",
    url: "https://yoryantra.com/tools/docker-compose-environment-variable-resolver",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Docker Compose Environment Variable Resolver | Yoryantra",
    description:
      "Resolve Docker Compose placeholders and find missing .env variables locally in your browser.",
  },
};

export default function DockerComposeEnvironmentVariableResolverPage() {
  return <ToolClient />;
}
