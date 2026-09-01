import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cron Expression Validator | 5-Field Cron Review | Yoryantra",
  description:
    "Validate five-field Unix-style cron syntax, lists, ranges, steps, aliases and day-field semantics, with scheduler, timezone and DST boundaries.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-validator",
  },
  openGraph: {
    title: "Cron Expression Validator | Yoryantra",
    description:
      "Check a practical five-field cron expression while keeping Unix cron, Kubernetes, GitHub Actions, Quartz and cloud-scheduler dialect differences explicit.",
    url: "https://yoryantra.com/tools/cron-expression-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Expression Validator | Yoryantra",
    description:
      "Validate five-field cron syntax and review day matching, frequency, scheduler dialect, timezone and DST boundaries.",
  },
};

export default function Page() {
  return <ToolClient />;
}
