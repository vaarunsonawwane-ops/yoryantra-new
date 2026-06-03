import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Claims Inspector | Check exp iat nbf aud iss Claims | Yoryantra",
  description:
    "Inspect JWT claims and check expiration, issued-at, not-before, issuer, audience, subject, scopes, roles, and common token claim issues directly in your browser.",
  keywords: [
    "JWT Claims Inspector",
    "JWT claims checker",
    "JWT exp checker",
    "JWT aud iss checker",
    "JWT token claims",
    "JWT expiration inspector",
    "JWT scope checker",
    "JWT role checker",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-claims-inspector",
  },
  openGraph: {
    title: "JWT Claims Inspector | Check exp iat nbf aud iss Claims | Yoryantra",
    description:
      "Inspect JWT claims and check expiration, issued-at, not-before, issuer, audience, subject, scopes, roles, and common token claim issues directly in your browser.",
    url: "https://yoryantra.com/tools/jwt-claims-inspector",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Claims Inspector | Check exp iat nbf aud iss Claims | Yoryantra",
    description:
      "Inspect JWT claims and check expiration, issued-at, not-before, issuer, audience, subject, scopes, roles, and common token claim issues directly in your browser.",
  },
};

export default function JWTClaimsInspectorPage() {
  return <ToolClient />;
}
