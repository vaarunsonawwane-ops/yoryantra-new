import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cron Expression Generator | Unix 5-Field Cron | Yoryantra",
  description:
    "Build five-field Unix cron expressions with ranges, lists, steps, month and weekday names, day-field warnings, and scheduler-boundary guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-generator",
  },
  openGraph: {
    title: "Cron Expression Generator | Yoryantra",
    description:
      "Generate five-field Unix cron schedules and catch syntax, range, step, day-field, and impossible date mistakes before deployment.",
    url: "https://yoryantra.com/tools/cron-expression-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Expression Generator | Yoryantra",
    description:
      "Build validated traditional five-field cron expressions for recurring jobs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
