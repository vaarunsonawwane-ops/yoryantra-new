import { tools } from "@/app/data/tools";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "Find Developer, SEO, Security, and Data Tools | Yoryantra",

  description:
    "Search Yoryantra tools by name, task, keyword, or category across development, DevOps, security, SEO, JSON, and encoding.",

  alternates: {
    canonical: "https://yoryantra.com/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[var(--dark)]">
          Find the Tool You Need
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Search by tool name, task, keyword, or category to find
          formatters, validators, encoders, security tools, SEO utilities, and
          developer helpers more quickly.
        </p>
      </div>

      <ToolsClient tools={tools} />
    </div>
  );
}
