export default function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f1dfb5] bg-[#fffaf0] p-6 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--light-gold)]">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  );
}