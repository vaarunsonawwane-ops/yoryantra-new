import { tools } from "@/app/data/tools";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "Search Free Developer Tools for JSON, Regex & SEO | Yoryantra",

  description:
    "Find free tools for JSON, regex, SEO, APIs, DevOps, and security. Search by name, task, or keyword to get to the right tool faster.",

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
