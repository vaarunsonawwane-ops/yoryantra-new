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
    <div>
      <h1 className="text-3xl font-bold text-[var(--dark)]">{title}</h1>

      {description && (
        <p className="text-gray-600 mt-3 mb-8">{description}</p>
      )}

      <div className="border rounded-2xl p-6 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}