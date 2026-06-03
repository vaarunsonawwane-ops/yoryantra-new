export default function SectionMiniCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#f3ead1] bg-[#fffdf8] p-4 transition duration-200 hover:shadow-sm">
      {children}
    </div>
  );
}