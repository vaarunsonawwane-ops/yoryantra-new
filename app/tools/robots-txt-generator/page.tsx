import ToolClient from "./ToolClient";

export const metadata = {
  title: "Robots.txt Generator | Build Crawler Rules | Yoryantra",
  description:
    "Build robots.txt groups with user-agent, Allow, Disallow, and Sitemap records. Review RFC 9309 rules and copy a clean robots.txt file.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-generator",
  },
  openGraph: {
    title: "Robots.txt Generator | Build Crawler Rules | Yoryantra",
    description:
      "Build robots.txt groups with user-agent, Allow, Disallow, and Sitemap records. Review RFC 9309 rules and copy a clean robots.txt file.",
    url: "https://yoryantra.com/tools/robots-txt-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robots.txt Generator | Build Crawler Rules | Yoryantra",
    description:
      "Build robots.txt groups with user-agent, Allow, Disallow, and Sitemap records. Review RFC 9309 rules and copy a clean robots.txt file.",
  },
};

export default function Page() {
  return <ToolClient />;
}
