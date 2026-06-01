import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "TLS Certificate Expiry Reminder Generator | SSL Renewal Checklist | Yoryantra",
  description:
    "Generate TLS certificate expiry reminders, SSL renewal checklists, calendar notes, and renewal action plans for domains, environments, issuers, and certificate owners.",
  keywords: [
    "TLS Certificate Expiry Reminder Generator",
    "SSL certificate expiry reminder",
    "TLS renewal checklist",
    "SSL renewal checklist",
    "certificate expiry reminder",
    "TLS certificate renewal",
    "SSL certificate renewal",
    "certificate monitoring checklist",
    "security tools",
    "DevOps security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/tls-certificate-expiry-reminder-generator",
  },
  openGraph: {
    title: "TLS Certificate Expiry Reminder Generator | SSL Renewal Checklist | Yoryantra",
    description:
      "Generate TLS certificate expiry reminders, SSL renewal checklists, calendar notes, and renewal action plans for domains, environments, issuers, and certificate owners.",
    url: "https://yoryantra.com/tools/tls-certificate-expiry-reminder-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TLS Certificate Expiry Reminder Generator | SSL Renewal Checklist | Yoryantra",
    description:
      "Generate TLS certificate expiry reminders, SSL renewal checklists, calendar notes, and renewal action plans for domains, environments, issuers, and certificate owners.",
  },
};

export default function TlsCertificateExpiryReminderGeneratorPage() {
  return <ToolClient />;
}
