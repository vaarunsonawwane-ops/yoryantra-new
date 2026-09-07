import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Dockerfile Instruction Explainer | Yoryantra",
  description:
    "Explain Dockerfile instructions, parser directives, build stages, runtime commands, base-image pinning, and stage-specific review concerns.",
  keywords: [
    "Dockerfile instruction explainer",
    "Dockerfile parser directives",
    "Dockerfile CMD ENTRYPOINT",
    "Dockerfile USER",
    "Dockerfile build stages",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/dockerfile-instruction-explainer" },
  openGraph: {
    title: "Dockerfile Instruction Explainer | Yoryantra",
    description:
      "Read Dockerfile instructions with stage-aware explanations, parser-directive handling, runtime behavior, and review boundaries.",
    url: "https://yoryantra.com/tools/dockerfile-instruction-explainer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dockerfile Instruction Explainer | Yoryantra",
    description:
      "Read Dockerfile instructions with stage-aware explanations, parser-directive handling, runtime behavior, and review boundaries.",
  },
};

export default function DockerfileInstructionExplainerPage() {
  return <ToolClient />;
}
