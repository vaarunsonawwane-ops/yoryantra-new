export default function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#f1dfb5] bg-[#fffaf0] p-8">
      {children}
    </div>
  );
}