import ToolClient from "./ToolClient";

export const metadata = {
  title: "MIME Type Finder – File Extension to Media Type | Yoryantra",
  description:
    "Look up common media types from file names or extensions, reverse-check known media types, and distinguish extension mapping from real file-content detection.",
  alternates: {
    canonical: "https://yoryantra.com/tools/mime-type-finder",
  },
  openGraph: {
    title: "MIME Type Finder – File Extension to Media Type | Yoryantra",
    description:
      "Find common media types from file extensions and inspect known media type names.",
    url: "https://yoryantra.com/tools/mime-type-finder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIME Type Finder – File Extension to Media Type | Yoryantra",
    description:
      "Look up common Content-Type media types from file names and extensions.",
  },
};

export default function Page() {
  return <ToolClient />;
}
