import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>

      <p className="text-gray-600 mb-10">
        All Yoryantra utilities in one place.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/tools/json-formatter">
          <div className="p-6 border rounded-xl hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-[var(--green)]">
              JSON Formatter
            </h2>
            <p className="text-gray-600 mt-2">
              Format, validate and minify JSON instantly.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}