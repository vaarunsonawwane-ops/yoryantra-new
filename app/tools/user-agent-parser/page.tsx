import ToolClient from "./ToolClient";

export const metadata = {
  title: "User Agent Parser | Browser, OS & Device Heuristics | Yoryantra",
  description:
    "Inspect a User-Agent string for browser family, version, operating system, device type, engine, bot signals, and reduction limitations.",
  alternates: {
    canonical: "https://yoryantra.com/tools/user-agent-parser",
  },
  openGraph: {
    title: "User Agent Parser | Browser, OS & Device Heuristics",
    description:
      "Inspect browser, OS, device, engine, bot, and reduced User-Agent signals locally in your browser.",
    url: "https://yoryantra.com/tools/user-agent-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "User Agent Parser | Yoryantra",
    description:
      "Inspect browser, OS, device, engine, bot, and User-Agent reduction signals.",
  },
};

export default function Page() {
  return <ToolClient />;
}
