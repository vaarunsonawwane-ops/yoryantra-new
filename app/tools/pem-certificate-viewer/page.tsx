import ToolClient from "./ToolClient";

export const metadata = {
  title: "PEM Certificate Viewer | Decode PEM Certificates Online | Yoryantra",

  description:
    "View PEM certificate details, inspect certificate blocks, decode readable certificate fields, and review PEM content directly in your browser.",

  keywords: [
    "pem certificate viewer",
    "pem viewer",
    "certificate viewer",
    "pem certificate decoder",
    "decode pem certificate",
    "x509 certificate viewer",
    "ssl certificate viewer",
    "certificate inspector",
    "security tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/pem-certificate-viewer",
  },

  openGraph: {
    title: "PEM Certificate Viewer | Decode PEM Certificates Online | Yoryantra",

    description:
      "View PEM certificate details, inspect certificate blocks, decode readable certificate fields, and review PEM content directly in your browser.",

    url: "https://yoryantra.com/tools/pem-certificate-viewer",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "PEM Certificate Viewer | Decode PEM Certificates Online | Yoryantra",

    description:
      "View PEM certificate details, inspect certificate blocks, decode readable certificate fields, and review PEM content directly in your browser.",
  },
};

export default function PEMCertificateViewerPage() {
  return <ToolClient />;
}
