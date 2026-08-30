import ToolClient from "./ToolClient";

export const metadata = {
  title: "URL Encoder Decoder | Percent-Encoding Tool | Yoryantra",
  description:
    "Encode and decode full URLs, URL components, and form-style query values with clear handling for reserved characters, UTF-8 percent encoding, %20, and + spaces.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-encoder-decoder",
  },
  openGraph: {
    title: "URL Encoder Decoder | Percent-Encoding Tool | Yoryantra",
    description:
      "Encode and decode full URLs, URL components, and form-style values with the correct percent-encoding behavior for each case.",
    url: "https://yoryantra.com/tools/url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Encoder Decoder | Yoryantra",
    description:
      "Encode or decode full URLs, URL components, and form-style query values.",
  },
};

export default function Page() {
  return <ToolClient />;
}
