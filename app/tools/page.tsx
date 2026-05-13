import ToolCard from "@/app/components/ToolCard";

const tools = [
  {
    title: "JSON Formatter",
    description: "Format, validate and beautify JSON instantly.",
    href: "/tools/json-formatter",
  },

  {
    title: "Slug Generator",
    description: "Convert text into SEO-friendly URL slugs.",
    href: "/tools/slug-generator",
  },

  {
    title: "URL Encoder",
    description: "Encode and decode URLs instantly.",
    href: "/tools/url-encoder",
  },

  {
  title: "Text Case Converter",
  description: "Convert text into uppercase, lowercase and title case.",
  href: "/tools/text-case-converter",
  },

  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 text quickly.",
    href: "/tools/base64-encoder",
  },
  
  {
  title: "URL Encoder Decoder",
  description: "Encode and decode URLs instantly.",
  href: "/tools/url-encoder",
  },
    
];

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
            key={tool.title}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}