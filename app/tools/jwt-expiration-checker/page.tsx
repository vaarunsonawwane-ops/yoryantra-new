import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Expiration Checker Online Free | Yoryantra",

  description:
    "Check JWT token expiration, issued time, and validity instantly with this free online JWT Expiration Checker.",

  keywords: [
    "jwt expiration checker",
    "jwt expiry checker",
    "check jwt expiration",
    "jwt token expiration validator",
    "jwt exp checker",
    "jwt validator",
    "jwt decoder",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/jwt-expiration-checker",
  },

  openGraph: {
    title:
      "JWT Expiration Checker Online Free | Yoryantra",

    description:
      "Check JWT token expiration, expiry time, and validity instantly online.",

    url:
      "https://yoryantra.com/tools/jwt-expiration-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JWT Expiration Checker Online Free | Yoryantra",

    description:
      "Check JWT token expiration and validity instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}