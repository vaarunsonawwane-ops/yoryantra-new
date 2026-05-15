import ToolClient from "./ToolClient";

export const metadata = {
  title: "bcrypt Generator Online Free | Yoryantra",

  description:
    "Generate bcrypt password hashes instantly with this free online bcrypt Generator. Useful for authentication, password storage, and security testing.",

  keywords: [
    "bcrypt generator",
    "bcrypt hash generator",
    "password hash generator",
    "generate bcrypt hash",
    "bcrypt online",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/bcrypt-generator",
  },

  openGraph: {
    title: "bcrypt Generator Online Free | Yoryantra",
    description:
      "Generate bcrypt password hashes instantly with this free online bcrypt Generator.",
    url: "https://yoryantra.com/tools/bcrypt-generator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "bcrypt Generator Online Free | Yoryantra",
    description:
      "Generate bcrypt hashes instantly with this free security tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}