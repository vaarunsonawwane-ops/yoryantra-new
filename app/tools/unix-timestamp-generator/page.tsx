import ToolClient from "./ToolClient";

export const metadata = {
  title: "Unix Timestamp Generator | Convert Date and Time Online | Yoryantra",

  description:
    "Generate Unix timestamps, convert dates to timestamps, and convert Unix time back to readable date and time directly in your browser.",

  keywords: [
    "unix timestamp generator",
    "timestamp generator",
    "date to unix timestamp",
    "unix timestamp converter",
    "epoch time generator",
    "convert date to timestamp",
    "convert timestamp to date",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/unix-timestamp-generator",
  },

  openGraph: {
    title: "Unix Timestamp Generator | Convert Date and Time Online | Yoryantra",

    description:
      "Generate Unix timestamps, convert dates to timestamps, and convert Unix time back to readable date and time directly in your browser.",

    url: "https://yoryantra.com/tools/unix-timestamp-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Unix Timestamp Generator | Convert Date and Time Online | Yoryantra",

    description:
      "Generate Unix timestamps, convert dates to timestamps, and convert Unix time back to readable date and time directly in your browser.",
  },
};

export default function UnixTimestampGeneratorPage() {
  return <ToolClient />;
}
