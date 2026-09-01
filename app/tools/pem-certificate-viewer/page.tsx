import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "PEM Certificate Viewer | X.509 Inspector | Yoryantra",
  description:
    "Inspect PEM blocks locally and decode X.509 subject, issuer, serial, validity, SANs, algorithms and SHA-256 fingerprint without claiming trust validation.",
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-certificate-viewer",
  },
  openGraph: {
    title: "PEM Certificate Viewer | Yoryantra",
    description:
      "Inspect PEM boundaries and useful X.509 certificate fields while keeping hostname, chain, revocation, trust, and private-key validation outside the tool's claims.",
    url: "https://yoryantra.com/tools/pem-certificate-viewer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PEM Certificate Viewer | Yoryantra",
    description:
      "View PEM block structure, X.509 fields, SANs, algorithms, validity and SHA-256 fingerprints locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
