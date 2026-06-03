import Link from "next/link";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* BREADCRUMB */}
      <div className="mb-8 flex items-center text-sm text-gray-500">

        <Link
          href="/"
          className="hover:!text-[var(--light-gold)] transition-colors duration-200"
        >
          Home
        </Link>

        <span className="mx-2">/</span>

        <Link
          href="/tools"
          className="hover:!text-[var(--light-gold)] transition-colors duration-200"
        >
          Tools
        </Link>

      </div>

      {children}
    </div>
  );
}