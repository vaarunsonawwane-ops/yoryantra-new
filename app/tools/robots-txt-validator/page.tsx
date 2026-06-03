import ToolClient from "./ToolClient";

export const metadata = {
  title: "Robots.txt Validator | Check Robots Rules Online | Yoryantra",

  description:
    "Validate robots.txt rules, check user-agent groups, disallow and allow paths, sitemap lines, crawl-delay values, and common robots.txt issues in your browser.",

  keywords: [
    "robots.txt validator",
    "robots txt validator",
    "robots.txt checker",
    "validate robots.txt",
    "robots txt syntax checker",
    "robots.txt tester",
    "robots rules checker",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-validator",
  },

  openGraph: {
    title: "Robots.txt Validator | Check Robots Rules Online | Yoryantra",

    description:
      "Validate robots.txt rules, check user-agent groups, disallow and allow paths, sitemap lines, crawl-delay values, and common robots.txt issues in your browser.",

    url: "https://yoryantra.com/tools/robots-txt-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Robots.txt Validator | Check Robots Rules Online | Yoryantra",

    description:
      "Validate robots.txt rules, check user-agent groups, disallow and allow paths, sitemap lines, crawl-delay values, and common robots.txt issues in your browser.",
  },
};

export default function RobotsTxtValidatorPage() {
  return <ToolClient />;
}
