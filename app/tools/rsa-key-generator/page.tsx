import ToolClient from "./ToolClient";

export const metadata = {
  title: "RSA Key Generator Online Free | Yoryantra",

  description:
    "Generate RSA public and private key pairs instantly with this free online RSA Key Generator.",

  keywords: [
    "rsa key generator",
    "rsa public private key generator",
    "generate rsa keys",
    "rsa private key generator",
    "rsa public key generator",
    "pem key generator",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/rsa-key-generator",
  },

  openGraph: {
    title:
      "RSA Key Generator Online Free | Yoryantra",

    description:
      "Generate RSA public and private key pairs instantly online.",

    url:
      "https://yoryantra.com/tools/rsa-key-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "RSA Key Generator Online Free | Yoryantra",

    description:
      "Generate RSA public and private keys instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}