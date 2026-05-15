import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cron Expression Generator Online Free | Yoryantra",

  description:
    "Generate cron expressions online for scheduled jobs, automation tasks, and server-side cron jobs instantly with this free cron expression generator.",

  keywords: [
    "cron expression generator",
    "cron job generator",
    "cron builder",
    "linux cron generator",
    "scheduler expression generator",
    "developer tools",
    "cron syntax generator",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/cron-expression-generator",
  },

  openGraph: {
    title:
      "Cron Expression Generator Online Free | Yoryantra",

    description:
      "Generate cron expressions instantly for scheduled tasks and automation workflows.",

    url:
      "https://yoryantra.com/tools/cron-expression-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Cron Expression Generator Online Free | Yoryantra",

    description:
      "Generate cron expressions for scheduled jobs and automation tasks instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}