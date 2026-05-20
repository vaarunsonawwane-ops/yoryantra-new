export default function SectionMiniCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#f1dfb5] bg-[#fffdf8] p-4">
      {children}
    </div>
  );
}