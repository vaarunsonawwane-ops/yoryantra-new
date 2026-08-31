import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cron Expression Generator | Unix 5-Field Cron | Yoryantra",
  description:
    "Build and validate traditional five-field Unix cron expressions with ranges, lists, steps, and month or weekday names.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-generator",
  },
  openGraph: {
    title: "Cron Expression Generator | Yoryantra",
    description:
      "Generate traditional Unix cron schedules and catch field-range or syntax mistakes before copying the expression.",
    url: "https://yoryantra.com/tools/cron-expression-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Expression Generator | Yoryantra",
    description:
      "Build validated five-field Unix cron expressions for recurring jobs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
