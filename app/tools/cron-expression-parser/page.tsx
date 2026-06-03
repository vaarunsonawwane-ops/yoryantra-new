import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cron Expression Parser | Read Cron Schedules Online | Yoryantra",

  description:
    "Parse cron expressions and understand cron schedules in simple language. Read cron syntax, check schedules, and review cron timing directly in your browser.",

  keywords: [
    "cron expression parser",
    "cron parser",
    "read cron expression",
    "cron schedule reader",
    "cron expression meaning",
    "parse cron schedule",
    "cron syntax checker",
    "understand cron expression",
    "cron schedule tool",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-parser",
  },

  openGraph: {
    title: "Cron Expression Parser | Read Cron Schedules Online | Yoryantra",

    description:
      "Parse cron expressions and understand cron schedules in simple language. Read cron syntax, check schedules, and review cron timing directly in your browser.",

    url: "https://yoryantra.com/tools/cron-expression-parser",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Cron Expression Parser | Read Cron Schedules Online | Yoryantra",

    description:
      "Parse cron expressions and understand cron schedules in simple language. Read cron syntax, check schedules, and review cron timing directly in your browser.",
  },
};

export default function CronExpressionParserPage() {
  return <ToolClient />;
}
