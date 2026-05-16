import ToolClient from "./ToolClient";

export const metadata = {
  title: "User Agent Parser Online Free | Yoryantra",

  description:
    "Parse browser and device user agents instantly with this free online User Agent Parser.",

  keywords: [
    "user agent parser",
    "parse user agent",
    "browser user agent parser",
    "device detector",
    "ua parser",
    "user agent analyzer",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/user-agent-parser",
  },

  openGraph: {
    title:
      "User Agent Parser Online Free | Yoryantra",

    description:
      "Parse browser and device user agents instantly online.",

    url:
      "https://yoryantra.com/tools/user-agent-parser",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "User Agent Parser Online Free | Yoryantra",

    description:
      "Parse browser and device user agents instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}