import ToolClient from "./ToolClient";

export const metadata = {
  title: "Meta Tag Generator Online Free | Yoryantra",

  description:
    "Generate SEO meta tags instantly with this free online Meta Tag Generator. Create title, description, Open Graph, and Twitter tags easily.",

  keywords: [
    "meta tag generator",
    "seo meta tags",
    "open graph generator",
    "twitter card generator",
    "website meta tags",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tag-generator",
  },

  openGraph: {
    title: "Meta Tag Generator Online Free | Yoryantra",

    description:
      "Generate SEO meta tags instantly with this free online Meta Tag Generator.",

    url: "https://yoryantra.com/tools/meta-tag-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Meta Tag Generator Online Free | Yoryantra",

    description:
      "Generate SEO and social meta tags instantly with this online generator.",
  },
};

export default function Page() {
  return <ToolClient />;
}