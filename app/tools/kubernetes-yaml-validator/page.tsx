import ToolClient from "./ToolClient";

export const metadata = {
  title: "Kubernetes YAML Validator | Multi-Document Manifest Checks",
  description:
    "Inspect Kubernetes YAML manifests document by document for required object fields and practical workload structure before using kubectl or the API server.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-yaml-validator",
  },
  openGraph: {
    title: "Kubernetes YAML Validator | Multi-Document Manifest Checks",
    description:
      "Check Kubernetes manifest structure, multiple YAML documents, workload templates, selectors, and common required fields locally.",
    url: "https://yoryantra.com/tools/kubernetes-yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes YAML Validator | Multi-Document Manifest Checks",
    description:
      "Inspect Kubernetes YAML structure before authoritative kubectl or API-server validation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
