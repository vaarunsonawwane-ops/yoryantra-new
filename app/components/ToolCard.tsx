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
    <Link href={href}>
      <div className="p-6 border rounded-2xl hover:shadow-md transition bg-white">

        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600 mt-3 leading-relaxed">
          {description}
        </p>

      </div>
    </Link>
  );
}