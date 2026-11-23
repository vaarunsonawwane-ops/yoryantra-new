import Link from "next/link";

export default function ToolShell({
  title,
  description,
  children,
  layout = "card",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Opt-in plain workspace for consolidated tools. The default preserves existing pages. */
  layout?: "card" | "plain";
}) {
  return (
    <div className={layout === "plain" ? "mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10" : "max-w-5xl mx-auto px-6 py-12"}>

      {/* BACK LINK */}
      <Link
        href="/tools"
        className="inline-flex items-center mb-6 text-sm text-gray-500 hover:!text-[var(--gold-text)] transition-colors duration-200"
      >
        ← Back to Tools
      </Link>

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>

      {/* DESCRIPTION */}
      {description && (
        <p className={layout === "plain" ? "mt-3 mb-7 text-gray-600 leading-relaxed" : "mt-4 mb-10 text-gray-600 leading-relaxed"}>
          {description}
        </p>
      )}

      {/* TOOL CONTENT */}
      <div className={layout === "plain" ? "min-w-0" : "bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"}>
        {children}
      </div>

    </div>
  );
}