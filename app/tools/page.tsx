import ToolCard from "@/app/components/ToolCard";
import { tools } from "@/app/data/tools";

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
      <h1 className="text-4xl font-bold text-[var(--dark)]">
        Yoryantra Tools
      </h1>

      <p className="mt-4 text-gray-600">
        Everyday tools you actually need, without the noise.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {tools.map((tool) => (
          <ToolCard
            key={tool.href}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}