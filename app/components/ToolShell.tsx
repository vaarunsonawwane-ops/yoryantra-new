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

      {/* Back to Tools */}
      <Link
        href="/tools"
        className="inline-block mb-6 text-sm text-gray-500 hover:text-[var(--light-gold)] transition-colors"
      >
        ← Back to Tools
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p className="text-gray-600 mt-3 mb-8">
          {description}
        </p>
      )}

      {/* Tool Content Box */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}