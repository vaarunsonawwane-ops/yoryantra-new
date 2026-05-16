import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Kubernetes YAML Validator Online Free | Yoryantra",

  description:
    "Validate Kubernetes YAML manifests instantly with this free online Kubernetes YAML Validator.",

  keywords: [
    "kubernetes yaml validator",
    "kubernetes manifest validator",
    "k8s yaml validator",
    "validate kubernetes yaml",
    "kubernetes deployment validator",
    "devops tools",
    "kubernetes tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/kubernetes-yaml-validator",
  },

  openGraph: {
    title:
      "Kubernetes YAML Validator Online Free | Yoryantra",

    description:
      "Validate Kubernetes YAML manifests instantly online.",

    url:
      "https://yoryantra.com/tools/kubernetes-yaml-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Kubernetes YAML Validator Online Free | Yoryantra",

    description:
      "Validate Kubernetes YAML manifests instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}