import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "NATO Phonetic Alphabet Converter – Text to Phonetic Words | Yoryantra",

  description:
    "Convert text into NATO phonetic alphabet words for clearer spelling, calls, support, radio-style communication, and text encoding workflows.",

  keywords: [
    "nato phonetic alphabet converter",
    "phonetic alphabet converter",
    "text to nato phonetic",
    "nato alphabet translator",
    "phonetic spelling converter",
    "military alphabet converter",
    "alpha bravo charlie converter",
    "text to phonetic words",
    "spelling alphabet converter",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/nato-phonetic-converter",
  },

  openGraph: {
    title:
      "NATO Phonetic Alphabet Converter – Text to Phonetic Words | Yoryantra",

    description:
      "Convert text into NATO phonetic alphabet words for clearer spelling, calls, support, and communication workflows.",

    url: "https://yoryantra.com/tools/nato-phonetic-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "NATO Phonetic Alphabet Converter – Text to Phonetic Words | Yoryantra",

    description:
      "Free NATO Phonetic Alphabet Converter for turning text into phonetic spelling words.",
  },
};

export default function Page() {
  return <ToolClient />;
}
