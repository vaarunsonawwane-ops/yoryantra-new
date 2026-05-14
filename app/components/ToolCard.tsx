import Link from "next/link";

export default function ToolCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="h-full p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-[var(--light-gold)] transition-colors duration-200">
          {title}
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-3 text-gray-600 leading-relaxed">
          {description}
        </p>

      </div>
    </Link>
  );
}