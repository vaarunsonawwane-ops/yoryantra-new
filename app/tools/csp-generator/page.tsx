import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSP Header Generator | Yoryantra",
  description:
    "Build a Content-Security-Policy header from common source directives and catch broad, malformed, or risky combinations before enforcement.",
  keywords: [
    "csp generator",
    "content security policy generator",
    "csp header generator",
    "script src csp",
    "csp nonce",
    "frame ancestors csp",
    "content security policy header",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-generator",
  },
  openGraph: {
    title: "CSP Header Generator | Yoryantra",
    description:
      "Build a CSP header from source lists and catch risky combinations before browser enforcement.",
    url: "https://yoryantra.com/tools/csp-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Header Generator | Yoryantra",
    description:
      "Build and review common Content-Security-Policy source directives before deployment.",
  },
};

export default function Page() {
  return <ToolClient />;
}
