import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Expiration Checker – exp, nbf & iat | Yoryantra",
  description:
    "Compare JWT exp, nbf, and iat NumericDate claims with the browser clock, apply clock tolerance, and keep timing separate from signature trust.",
  keywords: [
    "jwt expiration checker",
    "jwt expiry checker",
    "jwt exp checker",
    "jwt nbf checker",
    "jwt iat checker",
    "jwt numericdate",
    "jwt clock skew",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-expiration-checker",
  },
  openGraph: {
    title: "JWT Expiration Checker – exp, nbf & iat | Yoryantra",
    description:
      "Compare JWT timing claims with the browser clock and see exactly what the result does not verify.",
    url: "https://yoryantra.com/tools/jwt-expiration-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Expiration Checker – exp, nbf & iat | Yoryantra",
    description:
      "Compare exp, nbf, and iat with the browser clock without confusing decoded timing with token trust.",
  },
};

export default function Page() {
  return <ToolClient />;
}
