import ToolClient from "./ToolClient";

export const metadata = {
  title: "CURL Command Builder | Build API Requests | Yoryantra",
  description:
    "Build POSIX-shell-safe curl commands from an HTTP method, URL, headers, and request body, with quoting and request-behavior guidance.",
  keywords: [
    "curl command builder",
    "curl request builder",
    "curl api request",
    "curl headers",
    "curl json body",
    "shell safe curl command",
    "http request curl",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/curl-command-builder",
  },
  openGraph: {
    title: "CURL Command Builder | Yoryantra",
    description:
      "Build curl requests with POSIX-shell-safe quoting for URLs, headers, and optional request bodies.",
    url: "https://yoryantra.com/tools/curl-command-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CURL Command Builder | Yoryantra",
    description:
      "Build curl requests with POSIX-shell-safe quoting for URLs, headers, and optional request bodies.",
  },
};

export default function Page() {
  return <ToolClient />;
}
