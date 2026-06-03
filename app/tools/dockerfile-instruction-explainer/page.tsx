import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Dockerfile Instruction Explainer | Explain Dockerfile Commands Online | Yoryantra",
  description:
    "Explain Dockerfile instructions such as FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, ARG, EXPOSE, WORKDIR, USER, HEALTHCHECK, and common Dockerfile mistakes.",
  keywords: [
    "Dockerfile Instruction Explainer",
    "Dockerfile explainer",
    "Dockerfile commands explained",
    "Dockerfile analyzer",
    "Dockerfile instruction checker",
    "Dockerfile best practices",
    "Dockerfile RUN COPY CMD ENTRYPOINT",
    "Dockerfile security checker",
    "DevOps tools",
    "Docker tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/dockerfile-instruction-explainer",
  },
  openGraph: {
    title: "Dockerfile Instruction Explainer | Explain Dockerfile Commands Online | Yoryantra",
    description:
      "Explain Dockerfile instructions such as FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, ARG, EXPOSE, WORKDIR, USER, HEALTHCHECK, and common Dockerfile mistakes.",
    url: "https://yoryantra.com/tools/dockerfile-instruction-explainer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dockerfile Instruction Explainer | Explain Dockerfile Commands Online | Yoryantra",
    description:
      "Explain Dockerfile instructions such as FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, ARG, EXPOSE, WORKDIR, USER, HEALTHCHECK, and common Dockerfile mistakes.",
  },
};

export default function DockerfileInstructionExplainerPage() {
  return <ToolClient />;
}
