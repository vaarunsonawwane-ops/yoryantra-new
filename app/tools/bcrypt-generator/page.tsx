import ToolClient from "./ToolClient";

export const metadata = {
  title: "bcrypt Generator Online Free | Yoryantra",

  description:
    "Generate secure bcrypt password hashes instantly with this free online bcrypt Generator.",

  keywords: [
    "bcrypt generator",
    "bcrypt hash generator",
    "password hash generator",
    "bcrypt online",
    "bcrypt password generator",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/bcrypt-generator",
  },

  openGraph: {
    title: "bcrypt Generator Online Free | Yoryantra",

    description:
      "Generate secure bcrypt password hashes instantly online.",

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
      "Generate secure bcrypt password hashes instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}