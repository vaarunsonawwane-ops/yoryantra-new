import ToolClient from "./ToolClient";

export const metadata = {
  title: "Robots.txt Tester Online Free | Yoryantra",

  description:
    "Test robots.txt rules against URLs and user agents instantly with this free online Robots.txt Tester.",

  keywords: [
    "robots.txt tester",
    "robots txt checker",
    "robots.txt validator",
    "test robots txt",
    "robots crawler tester",
    "seo robots tester",
    "technical seo tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/robots-txt-tester",
  },

  openGraph: {
    title:
      "Robots.txt Tester Online Free | Yoryantra",

    description:
      "Test robots.txt rules against URLs and user agents instantly online.",

    url:
      "https://yoryantra.com/tools/robots-txt-tester",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Robots.txt Tester Online Free | Yoryantra",

    description:
      "Test robots.txt rules instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}