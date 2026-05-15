import ToolClient from "./ToolClient";

export const metadata = {
  title: "Password Generator Online Free | Yoryantra",

  description:
    "Generate strong random passwords instantly with this free online Password Generator.",

  keywords: [
    "password generator",
    "random password generator",
    "secure password generator",
    "strong password generator",
    "online password generator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/password-generator",
  },

  openGraph: {
    title: "Password Generator Online Free | Yoryantra",

    description:
      "Generate strong random passwords instantly with this free online Password Generator.",

    url: "https://yoryantra.com/tools/password-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Password Generator Online Free | Yoryantra",

    description:
      "Generate secure random passwords instantly with this free Password Generator.",
  },
};

export default function Page() {
  return <ToolClient />;
}