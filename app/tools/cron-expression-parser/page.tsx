import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cron Expression Parser | Read 5-Field Schedules | Yoryantra",
  description:
    "Parse five-field cron expressions into readable schedule rules with lists, ranges, steps, month and weekday names, day-field warnings, and date checks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-parser",
  },
  openGraph: {
    title: "Cron Expression Parser | Yoryantra",
    description:
      "Read five-field cron syntax field by field and catch schedule assumptions that a syntactically valid expression can still hide.",
    url: "https://yoryantra.com/tools/cron-expression-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Expression Parser | Yoryantra",
    description:
      "Understand traditional five-field Unix cron expressions, including lists, ranges, steps, names, and day matching.",
  },
};

export default function Page() {
  return <ToolClient />;
}
