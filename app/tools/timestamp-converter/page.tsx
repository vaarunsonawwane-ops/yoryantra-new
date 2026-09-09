import ToolClient from "./ToolClient";

export const metadata = {
  title: "Unix Timestamp Converter: Seconds & Milliseconds | Yoryantra",
  description:
    "Convert Unix timestamps from explicit seconds or milliseconds into UTC, ISO 8601, browser-local time, and normalized epoch milliseconds.",
  keywords: [
    "Unix timestamp converter",
    "epoch time converter",
    "Unix seconds to date",
    "Unix milliseconds to date",
    "timestamp to ISO 8601",
    "JavaScript Date timestamp",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/timestamp-converter",
  },
  openGraph: {
    title: "Unix Timestamp Converter: Seconds & Milliseconds | Yoryantra",
    description:
      "Convert explicit Unix seconds or milliseconds into UTC, ISO 8601, browser-local time, and normalized epoch values.",
    url: "https://yoryantra.com/tools/timestamp-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unix Timestamp Converter: Seconds & Milliseconds | Yoryantra",
    description:
      "Convert Unix seconds or milliseconds without unit guessing and compare UTC, ISO, and browser-local representations.",
  },
};

export default function Page() {
  return <ToolClient />;
}
