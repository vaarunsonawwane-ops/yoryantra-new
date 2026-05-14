import Link from "next/link";

export default function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* BACK LINK */}
      <Link
        href="/tools"
        className="inline-flex items-center mb-6 text-sm text-gray-500 hover:!text-[var(--light-gold)] transition-colors duration-200"
      >
        ← Back to Tools
      </Link>

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>

      {/* DESCRIPTION */}
      {description && (
        <p className="mt-4 mb-10 text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* TOOL CONTENT */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {children}
      </div>

    </div>
  );
}