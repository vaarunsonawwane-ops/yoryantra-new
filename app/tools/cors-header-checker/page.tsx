import ToolClient from "./ToolClient";

export const metadata = {
  title: "CORS Header Checker | Yoryantra",
  description:
    "Compare CORS response headers with an origin, method, request headers, and credentials context to find browser-blocking mismatches.",
  keywords: [
    "cors header checker",
    "cors preflight checker",
    "access control allow origin",
    "access control allow headers",
    "cors credentials",
    "cors debugging",
    "browser cors error",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cors-header-checker",
  },
  openGraph: {
    title: "CORS Header Checker | Yoryantra",
    description:
      "Compare pasted CORS response headers with the browser request context that has to match them.",
    url: "https://yoryantra.com/tools/cors-header-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CORS Header Checker | Yoryantra",
    description:
      "Check CORS origins, preflight permissions, credentials, request methods, and request-header mismatches.",
  },
};

export default function Page() {
  return <ToolClient />;
}
