import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Tag & Open Graph Generator | Search, Canonical & Social Tags | Yoryantra",
  description:
    "Generate escaped title, description, canonical, robots, Open Graph, structured image metadata, and X card markup with URL and preview checks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tag-generator",
  },
  openGraph: {
    title: "Meta Tag & Open Graph Generator | Yoryantra",
    description:
      "Generate escaped search, canonical, Open Graph, structured social-image, and X card metadata without fixed-length SEO scoring.",
    url: "https://yoryantra.com/tools/meta-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tag & Open Graph Generator | Yoryantra",
    description:
      "Generate title, description, canonical, robots, Open Graph image details, and X card markup locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
