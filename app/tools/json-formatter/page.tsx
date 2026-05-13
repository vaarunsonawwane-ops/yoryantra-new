import ToolShell from "@/app/components/ToolShell";

export default function JsonFormatter() {
  return (
    <ToolShell
      title="JSON Formatter"
      description="Format, validate and minify JSON instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste your JSON here..."
      />

      <button className="mt-4 px-6 py-2 bg-[var(--green)] text-white rounded-lg">
        Format JSON
      </button>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        Output will appear here...
      </div>
    </ToolShell>
  );
}