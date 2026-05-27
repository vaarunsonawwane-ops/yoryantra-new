import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cron Expression Validator | Check Cron Syntax Online | Yoryantra",

  description:
    "Validate cron expressions, check cron syntax, preview schedule meaning, and find common cron timing issues directly in your browser.",

  keywords: [
    "cron expression validator",
    "cron validator",
    "cron syntax checker",
    "validate cron expression",
    "cron checker",
    "cron schedule validator",
    "cron expression checker",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/cron-expression-validator",
  },

  openGraph: {
    title: "Cron Expression Validator | Check Cron Syntax Online | Yoryantra",

    description:
      "Validate cron expressions, check cron syntax, preview schedule meaning, and find common cron timing issues directly in your browser.",

    url: "https://yoryantra.com/tools/cron-expression-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Cron Expression Validator | Check Cron Syntax Online | Yoryantra",

    description:
      "Validate cron expressions, check cron syntax, preview schedule meaning, and find common cron timing issues directly in your browser.",
  },
};

export default function CronExpressionValidatorPage() {
  return <ToolClient />;
}
