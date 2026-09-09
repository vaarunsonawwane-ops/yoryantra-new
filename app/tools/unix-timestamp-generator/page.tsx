import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Unix Timestamp Generator | Date to Epoch Seconds or Milliseconds | Yoryantra",
  description:
    "Generate Unix seconds or milliseconds from local or UTC dates, or convert an explicitly selected timestamp unit into ISO, UTC, and browser-local time.",
  keywords: [
    "unix timestamp generator",
    "date to unix timestamp",
    "epoch seconds generator",
    "epoch milliseconds generator",
    "timestamp to date",
    "unix seconds to date",
    "unix milliseconds to date",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/unix-timestamp-generator",
  },
  openGraph: {
    title: "Unix Timestamp Generator | Date to Epoch Seconds or Milliseconds | Yoryantra",
    description:
      "Convert dates and explicit Unix second or millisecond values without relying on timestamp-length guessing.",
    url: "https://yoryantra.com/tools/unix-timestamp-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unix Timestamp Generator | Yoryantra",
    description:
      "Generate Unix timestamps from local or UTC dates and convert explicit epoch units back to readable time.",
  },
};

export default function UnixTimestampGeneratorPage() {
  return <ToolClient />;
}
