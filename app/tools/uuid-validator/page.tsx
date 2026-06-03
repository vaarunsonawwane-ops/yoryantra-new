import ToolClient from "./ToolClient";

export const metadata = {
  title: "UUID Validator | Check UUID Format Online | Yoryantra",

  description:
    "Validate UUID values, check UUID format, detect UUID versions, and inspect UUID strings directly in your browser.",

  keywords: [
    "uuid validator",
    "validate uuid",
    "uuid checker",
    "check uuid format",
    "uuid version checker",
    "uuid format validator",
    "uuid string validator",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/uuid-validator",
  },

  openGraph: {
    title: "UUID Validator | Check UUID Format Online | Yoryantra",

    description:
      "Validate UUID values, check UUID format, detect UUID versions, and inspect UUID strings directly in your browser.",

    url: "https://yoryantra.com/tools/uuid-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "UUID Validator | Check UUID Format Online | Yoryantra",

    description:
      "Validate UUID values, check UUID format, detect UUID versions, and inspect UUID strings directly in your browser.",
  },
};

export default function UUIDValidatorPage() {
  return <ToolClient />;
}
