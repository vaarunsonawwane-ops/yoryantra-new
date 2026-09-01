import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Dockerfile Linter | Build, Cache & Security Review | Yoryantra",
  description:
    "Review Dockerfiles for common stage, package, cache, secret, COPY, USER, WORKDIR, command-form, and parser-directive issues before a real Docker build.",
  alternates: {
    canonical: "https://yoryantra.com/tools/dockerfile-linter",
  },
  openGraph: {
    title: "Dockerfile Linter | Yoryantra",
    description:
      "Inspect Dockerfile text for practical build, cache, package-management, secret-handling, stage, and runtime issues without pretending a text scan replaces BuildKit.",
    url: "https://yoryantra.com/tools/dockerfile-linter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dockerfile Linter | Yoryantra",
    description:
      "Review Dockerfile patterns before building and understand which findings need Docker or BuildKit verification.",
  },
};

export default function Page() {
  return <ToolClient />;
}
