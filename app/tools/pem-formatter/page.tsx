import ToolClient from "./ToolClient";

export const metadata = {
  title: "PEM Formatter for Certificates, Keys and CSRs | Yoryantra",
  description:
    "Normalize PEM boundaries, Base64 padding and 64-character wrapping for certificates, public keys, private keys, CSRs and multi-block files.",
  keywords: [
    "pem formatter",
    "certificate pem formatter",
    "private key pem formatter",
    "public key pem formatter",
    "csr pem formatter",
    "pem 64 character lines",
    "rfc 7468 pem",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-formatter",
  },
  openGraph: {
    title: "PEM Formatter for Certificates, Keys and CSRs | Yoryantra",
    description:
      "Normalize PEM boundaries, Base64 padding and 64-character wrapping across certificates, keys, CSRs and multi-block files.",
    url: "https://yoryantra.com/tools/pem-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEM Formatter for Certificates, Keys and CSRs | Yoryantra",
    description:
      "Normalize PEM boundaries, Base64 padding and 64-character wrapping for certificates, keys and CSRs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
