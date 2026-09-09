import ToolClient from "./ToolClient";

export const metadata = {
  title: "UUID Generator | RFC 9562 UUIDv4 | Yoryantra",
  description:
    "Generate RFC 9562 UUIDv4 identifiers from cryptographically secure browser randomness and copy the canonical UUID string.",
  keywords: [
    "uuid generator",
    "uuid v4 generator",
    "rfc 9562 uuid",
    "random uuid",
    "cryptographic uuid generator",
    "browser uuid generator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/uuid-generator",
  },
  openGraph: {
    title: "UUID Generator | RFC 9562 UUIDv4 | Yoryantra",
    description:
      "Generate UUIDv4 identifiers locally with cryptographically secure browser randomness.",
    url: "https://yoryantra.com/tools/uuid-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UUID Generator | RFC 9562 UUIDv4 | Yoryantra",
    description:
      "Generate UUIDv4 identifiers locally with cryptographically secure browser randomness.",
  },
};

export default function Page() {
  return <ToolClient />;
}
