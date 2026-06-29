import ToolClient from "./ToolClient";

export const metadata = {
  title: "bcrypt Hash Generator Online | Yoryantra",

  description:
    "Generate bcrypt password hashes online with selectable cost factors. Create salted bcrypt hashes locally in your browser for development and testing.",

  keywords: [
    "bcrypt generator",
    "bcrypt hash generator",
    "bcrypt online",
    "bcrypt password hash generator",
    "generate bcrypt hash",
    "bcrypt password",
    "bcrypt cost factor",
    "bcrypt salt rounds",
    "online password hash generator",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/bcrypt-generator",
  },

  openGraph: {
    title: "bcrypt Hash Generator Online | Yoryantra",

    description:
      "Generate salted bcrypt password hashes online with selectable cost factors, directly in your browser.",

    url:
      "https://yoryantra.com/tools/bcrypt-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "bcrypt Generator Online Free | Yoryantra",

    description:
      "Generate salted bcrypt password hashes locally with selectable cost factors.",
  },
};

export default function Page() {
  return <ToolClient />;
}