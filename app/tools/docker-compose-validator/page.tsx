import ToolClient from "./ToolClient";

export const metadata = {
  title: "Docker Compose Validator | Structural YAML Checks",
  description:
    "Inspect Docker Compose YAML for syntax, service structure, common type mistakes, references, and obsolete version usage before running Docker Compose.",
  alternates: {
    canonical: "https://yoryantra.com/tools/docker-compose-validator",
  },
  openGraph: {
    title: "Docker Compose Validator | Structural YAML Checks",
    description:
      "Inspect Compose YAML structure, services, common field types, references, and version warnings in your browser.",
    url: "https://yoryantra.com/tools/docker-compose-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docker Compose Validator | Structural YAML Checks",
    description:
      "Check Compose YAML structure and common configuration mistakes before using the Docker Compose CLI.",
  },
};

export default function Page() {
  return <ToolClient />;
}
