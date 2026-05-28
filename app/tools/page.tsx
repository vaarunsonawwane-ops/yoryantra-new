import { tools } from "@/app/data/tools";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "All Tools | Yoryantra",

  description:
    "Browse practical browser tools for formatting, encoding, debugging, validation, SEO, security, JSON, DevOps, and everyday work.",

  alternates: {
    canonical: "https://yoryantra.com/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[var(--dark)]">
          Yoryantra Tools
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Search practical browser tools by name, keyword, or category. Find
          formatters, validators, encoders, SEO utilities, security tools, and
          developer helpers without digging through a long list.
        </p>
      </div>

      <ToolsClient tools={tools} />
    </div>
  );
}
