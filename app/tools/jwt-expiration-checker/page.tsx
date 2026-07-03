import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Expiration Checker for exp, nbf and iat | Yoryantra",
  description:
    "Inspect JWT exp, nbf, and iat NumericDate claims, convert them to UTC, and review the token time window without verifying its signature.",
  keywords: [
    "jwt expiration checker",
    "jwt expiry checker",
    "check jwt expiration",
    "jwt exp checker",
    "jwt nbf checker",
    "jwt iat decoder",
    "jwt decoder",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-expiration-checker",
  },
  openGraph: {
    title: "JWT Expiration Checker for exp, nbf and iat | Yoryantra",
    description:
      "Inspect JWT timing claims and convert NumericDate values to readable UTC without verifying the token signature.",
    url: "https://yoryantra.com/tools/jwt-expiration-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Expiration Checker for exp, nbf and iat | Yoryantra",
    description:
      "Inspect JWT timing claims and convert NumericDate values to readable UTC.",
  },
};

export default function Page() {
  return <ToolClient />;
}
