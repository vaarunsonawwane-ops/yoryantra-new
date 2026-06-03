import ToolClient from "./ToolClient";

export const metadata = {
  title: "UTM Builder Online Free | Yoryantra",

  description:
    "Generate UTM tracking URLs instantly with this free online UTM Builder.",

  keywords: [
    "utm builder",
    "utm generator",
    "utm url builder",
    "google analytics utm builder",
    "campaign url builder",
    "utm tracking url generator",
    "marketing tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/utm-builder",
  },

  openGraph: {
    title:
      "UTM Builder Online Free | Yoryantra",

    description:
      "Generate UTM tracking URLs instantly online.",

    url:
      "https://yoryantra.com/tools/utm-builder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "UTM Builder Online Free | Yoryantra",

    description:
      "Generate UTM tracking URLs instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}