import ToolClient from "./ToolClient";

export const metadata = {
  title: "Dockerfile Linter | Check Dockerfile Issues Online | Yoryantra",

  description:
    "Check Dockerfile content for common issues, missing instructions, risky patterns, and basic Dockerfile best practices directly in your browser.",

  keywords: [
    "dockerfile linter",
    "dockerfile checker",
    "dockerfile validator",
    "check dockerfile",
    "dockerfile best practices",
    "dockerfile syntax checker",
    "dockerfile issues",
    "docker devops tool",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/dockerfile-linter",
  },

  openGraph: {
    title: "Dockerfile Linter | Check Dockerfile Issues Online | Yoryantra",

    description:
      "Check Dockerfile content for common issues, risky patterns, and basic Dockerfile best practices directly in your browser.",

    url: "https://yoryantra.com/tools/dockerfile-linter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Dockerfile Linter | Check Dockerfile Issues Online | Yoryantra",

    description:
      "Check Dockerfile content for common issues, risky patterns, and basic Dockerfile best practices directly in your browser.",
  },
};

export default function DockerfileLinterPage() {
  return <ToolClient />;
}
