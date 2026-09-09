import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "TLS Certificate Expiry Reminder Generator | Renewal Planning | Yoryantra",
  description:
    "Plan TLS certificate renewal from a known expiry date with reminder dates, ownership notes, validation checks, and calendar-ready output.",
  keywords: [
    "TLS Certificate Expiry Reminder Generator",
    "SSL certificate expiry reminder",
    "TLS renewal checklist",
    "SSL renewal checklist",
    "certificate expiry reminder",
    "TLS certificate renewal",
    "SSL certificate renewal",
    "certificate renewal checklist",
    "security tools",
    "DevOps security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/tls-certificate-expiry-reminder-generator",
  },
  openGraph: {
    title: "TLS Certificate Expiry Reminder Generator | Renewal Planning | Yoryantra",
    description:
      "Plan TLS certificate renewal from a known expiry date with reminder dates, ownership notes, validation checks, and calendar-ready output.",
    url: "https://yoryantra.com/tools/tls-certificate-expiry-reminder-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TLS Certificate Expiry Reminder Generator | Renewal Planning | Yoryantra",
    description:
      "Plan TLS certificate renewal from a known expiry date with reminder dates, ownership notes, validation checks, and calendar-ready output.",
  },
};

export default function TlsCertificateExpiryReminderGeneratorPage() {
  return <ToolClient />;
}
