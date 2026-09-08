import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Shell Command Escape Tool | POSIX, PowerShell & CMD Quoting",
  description:
    "Quote literal arguments for POSIX shells or PowerShell, inspect metacharacters, and surface Windows CMD and dotenv context limits without executing commands.",
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
    title: "Shell Command Escape Tool | POSIX, PowerShell & CMD Quoting",
    description:
      "Quote literal arguments for POSIX shells or PowerShell, inspect metacharacters, and surface Windows CMD and dotenv context limits without executing commands.",
    url: "https://yoryantra.com/tools/shell-command-escape-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shell Command Escape Tool | POSIX, PowerShell & CMD Quoting",
    description:
      "Quote literal arguments for POSIX shells or PowerShell, inspect metacharacters, and surface Windows CMD and dotenv context limits without executing commands.",
  },
};

export default function ShellCommandEscapeToolPage() {
  return <ToolClient />;
}
