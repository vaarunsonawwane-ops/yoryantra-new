export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* breadcrumb / back */}
      <div className="mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-[var(--green)]">
          Home
        </a>{" "}
        /{" "}
        <a href="/tools" className="hover:text-[var(--green)]">
          Tools
        </a>
      </div>

      {children}
    </div>
  );
}