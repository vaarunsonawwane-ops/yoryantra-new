import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "User Agent Parser | Browser, OS & Device Heuristics | Yoryantra",
  description:
    "Inspect User-Agent strings for browser or client family, OS, device clues, engine hints, bot tokens, architecture signals, and reduced or frozen values.",
  alternates: {
    canonical: "https://yoryantra.com/tools/user-agent-parser",
  },
  openGraph: {
    title: "User Agent Parser | Browser, OS & Device Heuristics | Yoryantra",
    description:
      "Read browser and non-browser User-Agent strings while keeping spoofing, reduction, and device-detection limits visible.",
    url: "https://yoryantra.com/tools/user-agent-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "User Agent Parser | Yoryantra",
    description:
      "Inspect User-Agent browser, OS, device, bot, engine, client, and reduction clues.",
  },
};

export default function Page() {
  return <ToolClient />;
}
