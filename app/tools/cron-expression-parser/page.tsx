import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cron Expression Parser | Read 5-Field Cron Schedules | Yoryantra",
  description:
    "Parse traditional five-field cron expressions with ranges, lists, steps, month and weekday names, and understand important day-of-month and weekday behavior.",
  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-parser",
  },
  openGraph: {
    title: "Cron Expression Parser | Read 5-Field Cron Schedules | Yoryantra",
    description:
      "Read traditional five-field cron schedules with ranges, lists, steps, month names, weekday names, and field-by-field explanations.",
    url: "https://yoryantra.com/tools/cron-expression-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Expression Parser | Read 5-Field Cron Schedules | Yoryantra",
    description:
      "Parse five-field Unix cron syntax and understand each schedule field.",
  },
};

export default function Page() {
  return <ToolClient />;
}
