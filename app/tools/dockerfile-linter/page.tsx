import ToolClient from "./ToolClient";

export const metadata = {
  title: "Dockerfile Linter | Check Common Build & Security Issues | Yoryantra",
  description:
    "Review Dockerfile instructions for common build-cache, package-install, secret, base-image, USER, COPY, ADD, CMD, ENTRYPOINT, and shell-pattern issues.",
  alternates: {
    canonical: "https://yoryantra.com/tools/dockerfile-linter",
  },
  openGraph: {
    title: "Dockerfile Linter | Check Common Build & Security Issues | Yoryantra",
    description:
      "Inspect Dockerfile text for common build, package-management, secret-handling, base-image, and container-runtime issues.",
    url: "https://yoryantra.com/tools/dockerfile-linter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dockerfile Linter | Check Common Build & Security Issues | Yoryantra",
    description:
      "Review Dockerfile text for practical build, security, cache, package, and runtime warnings.",
  },
};

export default function Page() {
  return <ToolClient />;
}
