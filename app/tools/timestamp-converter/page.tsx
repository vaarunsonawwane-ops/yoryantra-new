import ToolClient from "./ToolClient";

export const metadata = {
  title: "Unix Timestamp Converter Online Free | Yoryantra",

  description:
    "Convert Unix timestamps into readable dates instantly with this free online Timestamp Converter. Easily transform epoch time into human-readable date and time formats.",

  keywords: [
    "timestamp converter",
    "unix timestamp converter",
    "epoch converter",
    "unix time converter",
    "timestamp to date",
    "epoch to date",
    "convert unix timestamp",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/timestamp-converter",
  },

  openGraph: {
    title: "Unix Timestamp Converter Online Free | Yoryantra",

    description:
      "Convert Unix timestamps into readable date and time instantly.",

    url: "https://yoryantra.com/tools/timestamp-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Unix Timestamp Converter Online Free | Yoryantra",

    description:
      "Free online Unix Timestamp Converter for epoch time and readable date conversion.",
  },
};

export default function Page() {
  return <ToolClient />;
}