import ToolClient from "./ToolClient";

export const metadata = {
  title: "MIME Type Finder Online Free | Yoryantra",

  description:
    "Find MIME types by file extension instantly with this free online MIME Type Finder.",

  keywords: [
    "mime type finder",
    "mime type lookup",
    "file mime type checker",
    "content type finder",
    "file extension mime type",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/mime-type-finder",
  },

  openGraph: {
    title: "MIME Type Finder Online Free | Yoryantra",
    description: "Find MIME types by file extension instantly online.",
    url: "https://yoryantra.com/tools/mime-type-finder",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "MIME Type Finder Online Free | Yoryantra",
    description: "Find MIME types instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}