import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Compose Environment Variable Resolver | Interpolation Preview | Yoryantra",
  description:
    "Preview Docker Compose interpolation with shell and .env precedence, fallback operators, required variables, literal dollars, and missing-value diagnostics.",
  keywords: [
    "Docker Compose environment variable resolver",
    "Docker Compose interpolation",
    "Compose env precedence",
    "Docker Compose variable substitution",
    "Compose .env parser",
    "Docker Compose config environment",
    "Compose required variable",
    "Compose default value",
    "DevOps tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-environment-variable-resolver",
  },
  openGraph: {
    title: "Docker Compose Environment Variable Resolver | Yoryantra",
    description:
      "Trace Compose variable interpolation, source precedence, fallback operators, and unresolved values before running Docker.",
    url: "https://yoryantra.com/tools/docker-compose-environment-variable-resolver",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Docker Compose Environment Variable Resolver | Yoryantra",
    description:
      "Trace Compose interpolation, shell precedence, fallbacks, required expressions, and unresolved values.",
  },
};

export default function DockerComposeEnvironmentVariableResolverPage() {
  return <ToolClient />;
}
