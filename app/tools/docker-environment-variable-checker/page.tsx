import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Docker Environment Variable Checker – .env & Compose | Yoryantra",
  description:
    "Review Docker .env and Compose environment values for duplicate keys, empty or omitted values, interpolation, invalid names, required variables, and secrets.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-environment-variable-checker",
  },
  openGraph: {
    title: "Docker Environment Variable Checker – .env & Compose | Yoryantra",
    description:
    "Review Docker .env and Compose environment values for duplicate keys, empty or omitted values, interpolation, invalid names, required variables, and secrets.",
    url: "https://yoryantra.com/tools/docker-environment-variable-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Environment Variable Checker – .env & Compose | Yoryantra",
    description:
    "Review Docker .env and Compose environment values for duplicate keys, empty or omitted values, interpolation, invalid names, required variables, and secrets.",
  },
};

export default function DockerEnvironmentVariableCheckerPage() {
  return <ToolClient />;
}
