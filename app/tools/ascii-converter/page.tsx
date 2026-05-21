import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "ASCII Converter – Convert Text to ASCII & ASCII to Text | Yoryantra",

  description:
    "Convert text to ASCII codes and decode ASCII values back into readable text for debugging, logs, scripts, encoding workflows, and development checks.",

  keywords: [
    "ascii converter",
    "text to ascii",
    "ascii to text",
    "ascii encoder decoder",
    "ascii decoder",
    "ascii encoder",
    "ascii code converter",
    "character code converter",
    "decode ascii values",
    "encoding tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/ascii-converter",
  },

  openGraph: {
    title:
      "ASCII Converter – Convert Text to ASCII & ASCII to Text | Yoryantra",

    description:
      "Convert text to ASCII codes and decode ASCII values back into readable text for debugging, logs, scripts, and encoding workflows.",

    url: "https://yoryantra.com/tools/ascii-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "ASCII Converter – Convert Text to ASCII & ASCII to Text | Yoryantra",

    description:
      "Free ASCII Converter for text, character codes, logs, debugging, scripts, and encoding workflows.",
  },
};

export default function Page() {
  return <ToolClient />;
}
