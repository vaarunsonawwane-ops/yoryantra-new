import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Permissions Policy Header Generator | Create Permissions-Policy Header | Yoryantra",
  description:
    "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, autoplay, and more directly in your browser.",
  keywords: [
    "Permissions Policy Header Generator",
    "Permissions-Policy generator",
    "Feature Policy generator",
    "Permissions Policy checker",
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
    title: "Permissions Policy Header Generator | Create Permissions-Policy Header | Yoryantra",
    description:
      "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, autoplay, and more directly in your browser.",
    url: "https://yoryantra.com/tools/permissions-policy-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Permissions Policy Header Generator | Create Permissions-Policy Header | Yoryantra",
    description:
      "Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, autoplay, and more directly in your browser.",
  },
};

export default function PermissionsPolicyHeaderGeneratorPage() {
  return <ToolClient />;
}
