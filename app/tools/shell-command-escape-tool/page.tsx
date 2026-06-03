import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Shell Command Escape Tool | Quote CLI Arguments Safely | Yoryantra",
  description:
    "Escape and quote text for shell commands, POSIX sh, Bash-style arguments, PowerShell strings, Windows CMD, and .env values without running any command.",
  keywords: [
    "Shell Command Escape Tool",
    "shell escape string",
    "bash escape string",
    "quote shell argument",
    "PowerShell escape string",
    "CMD escape string",
    "CLI argument escape",
    "env value escape",
    "command line escaping",
    "DevOps encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/shell-command-escape-tool",
  },
  openGraph: {
    title: "Shell Command Escape Tool | Quote CLI Arguments Safely | Yoryantra",
    description:
      "Escape and quote text for shell commands, POSIX sh, Bash-style arguments, PowerShell strings, Windows CMD, and .env values without running any command.",
    url: "https://yoryantra.com/tools/shell-command-escape-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shell Command Escape Tool | Quote CLI Arguments Safely | Yoryantra",
    description:
      "Escape and quote text for shell commands, POSIX sh, Bash-style arguments, PowerShell strings, Windows CMD, and .env values without running any command.",
  },
};

export default function ShellCommandEscapeToolPage() {
  return <ToolClient />;
}
