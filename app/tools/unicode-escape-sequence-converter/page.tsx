import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Unicode Escape Sequence Converter | JavaScript Escapes | Yoryantra",
  description: "Decode or encode \\uXXXX, \\u{...}, \\xXX, and numeric HTML references while inspecting Unicode code points and surrogate pairs.",
  alternates: { canonical: "https://yoryantra.com/tools/unicode-escape-sequence-converter" },
  openGraph: { title: "Unicode Escape Sequence Converter | Yoryantra", description: "Decode and encode JavaScript Unicode escapes while exposing code points, surrogate pairs, and invalid scalar values.", url: "https://yoryantra.com/tools/unicode-escape-sequence-converter", siteName: "Yoryantra", type: "website" },
  twitter: { card: "summary", title: "Unicode Escape Sequence Converter | Yoryantra", description: "Decode and encode Unicode escapes with code-point and surrogate-pair inspection." },
};

export default function UnicodeEscapeSequenceConverterPage() { return <ToolClient />; }
