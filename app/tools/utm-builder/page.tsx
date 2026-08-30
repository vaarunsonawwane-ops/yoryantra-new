import ToolClient from "./ToolClient";

export const metadata = {
  title: "UTM Builder | Campaign URL Generator | Yoryantra",
  description:
    "Build campaign URLs with Google Analytics UTM parameters while preserving existing query parameters and URL fragments.",
  alternates: {
    canonical: "https://yoryantra.com/tools/utm-builder",
  },
  openGraph: {
    title: "UTM Builder | Campaign URL Generator",
    description:
      "Create consistent campaign URLs with UTM source, medium, campaign, ID, term, content, and newer GA4 parameters.",
    url: "https://yoryantra.com/tools/utm-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UTM Builder | Yoryantra",
    description:
      "Build campaign URLs with current Google Analytics UTM parameters.",
  },
};

export default function Page() {
  return <ToolClient />;
}
