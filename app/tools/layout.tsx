export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* breadcrumb / back */}
      <div className="mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-[var(--light-gold)] transition-colors">
          Home
        </a>

        <span className="mx-1">/</span>

        <a href="/tools" className="hover:text-[var(--light-gold)] transition-colors">
          Tools
        </a>
      </div>

      {children}
    </div>
  );
}