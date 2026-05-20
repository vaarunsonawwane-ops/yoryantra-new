export default function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      {children}
    </section>
  );
}