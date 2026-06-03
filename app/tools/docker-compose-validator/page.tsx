import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Docker Compose Validator Online Free | Yoryantra",

  description:
    "Validate Docker Compose YAML files instantly with this free online Docker Compose Validator.",

  keywords: [
    "docker compose validator",
    "docker compose yaml validator",
    "docker compose checker",
    "validate docker compose",
    "docker yaml validator",
    "devops tools",
    "docker tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/docker-compose-validator",
  },

  openGraph: {
    title:
      "Docker Compose Validator Online Free | Yoryantra",

    description:
      "Validate Docker Compose YAML files instantly online.",

    url:
      "https://yoryantra.com/tools/docker-compose-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Docker Compose Validator Online Free | Yoryantra",

    description:
      "Validate Docker Compose YAML files instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}