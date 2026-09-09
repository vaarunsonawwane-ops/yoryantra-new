import ToolClient from "./ToolClient";

export const metadata = {
  title: "UUID Validator | RFC 9562 Version & Variant Check | Yoryantra",
  description:
    "Validate UUID text, identify RFC 9562 versions and variants, and recognize canonical, URN, Nil, Max, and reserved forms.",
  keywords: [
    "uuid validator",
    "rfc 9562 uuid validator",
    "uuid version checker",
    "uuid variant checker",
    "uuid urn validator",
    "uuid format check",
    "uuid v7 validator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/uuid-validator",
  },
  openGraph: {
    title: "UUID Validator | RFC 9562 | Yoryantra",
    description:
      "Check UUID string form, version, variant, and special Nil or Max values against RFC 9562.",
    url: "https://yoryantra.com/tools/uuid-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UUID Validator | RFC 9562 | Yoryantra",
    description:
      "Check UUID string form, version, variant, and special Nil or Max values against RFC 9562.",
  },
};

export default function UUIDValidatorPage() {
  return <ToolClient />;
}
