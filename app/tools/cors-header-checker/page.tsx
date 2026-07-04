import ToolClient from "./ToolClient";

export const metadata = {
  title: "CORS Header Checker | Yoryantra",
  description:
    "Check CORS response headers for allowed origins, credentials, methods, request headers, preflight behavior, and common browser issues.",
  keywords: [
    "cors header checker",
    "cors checker",
    "access control allow origin checker",
    "cors validator",
    "cors preflight checker",
    "access control allow credentials",
    "api cors debugging tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cors-header-checker",
  },
  openGraph: {
    title: "CORS Header Checker | Yoryantra",
    description:
      "Check CORS response headers for origins, credentials, methods, request headers, and browser preflight issues.",
    url: "https://yoryantra.com/tools/cors-header-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CORS Header Checker | Yoryantra",
    description:
      "Check CORS response headers and find common browser CORS configuration issues.",
  },
};

export default function Page() {
  return <ToolClient />;
}
