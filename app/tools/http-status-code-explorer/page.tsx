import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Status Code Explorer Online Free | Yoryantra",

  description:
    "Search and understand HTTP status codes instantly with this free online HTTP Status Code Explorer.",

  keywords: [
    "http status code explorer",
    "http status code lookup",
    "http code checker",
    "status code finder",
    "http response code",
    "api debugging tools",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/http-status-code-explorer",
  },

  openGraph: {
    title: "HTTP Status Code Explorer Online Free | Yoryantra",
    description: "Search and understand HTTP status codes instantly online.",
    url: "https://yoryantra.com/tools/http-status-code-explorer",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HTTP Status Code Explorer Online Free | Yoryantra",
    description: "Search HTTP status codes instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}