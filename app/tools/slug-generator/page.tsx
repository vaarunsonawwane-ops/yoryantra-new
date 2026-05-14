import ToolClient from "./ToolClient";

export const metadata = {
  title: "Slug Generator Online Free | Yoryantra",

  description:
    "Generate clean SEO-friendly URL slugs instantly with this free online Slug Generator. Convert text into readable, optimized, and web-safe URL structures quickly.",

  keywords: [
    "slug generator",
    "seo slug generator",
    "url slug generator",
    "slugify text",
    "generate slug online",
    "seo url creator",
    "clean url generator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/slug-generator",
  },

  openGraph: {
    title: "Slug Generator Online Free | Yoryantra",

    description:
      "Generate SEO-friendly URL slugs instantly with this free online slug generator.",

    url: "https://yoryantra.com/tools/slug-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Slug Generator Online Free | Yoryantra",

    description:
      "Convert text into clean and SEO-friendly URL slugs instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}