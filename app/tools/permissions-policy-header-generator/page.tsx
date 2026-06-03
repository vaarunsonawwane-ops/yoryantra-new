import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Permissions Policy Header Generator | Browser Feature Policy Tool | Yoryantra",
  description:
    "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, and more directly in your browser.",
  keywords: [
    "Permissions Policy Header Generator",
    "Permissions-Policy generator",
    "Feature Policy generator",
    "browser permissions policy",
    "Permissions Policy header",
    "camera microphone geolocation policy",
    "security header generator",
    "browser feature policy",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/permissions-policy-header-generator",
  },
  openGraph: {
    title: "Permissions Policy Header Generator | Browser Feature Policy Tool | Yoryantra",
    description:
      "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, and more directly in your browser.",
    url: "https://yoryantra.com/tools/permissions-policy-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Permissions Policy Header Generator | Browser Feature Policy Tool | Yoryantra",
    description:
      "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, and more directly in your browser.",
  },
};

export default function PermissionsPolicyHeaderGeneratorPage() {
  return <ToolClient />;
}
