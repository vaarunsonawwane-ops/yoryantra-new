import Link from "next/link";
import {
  getCategoryHref,
  getRelatedTools,
  getToolByHref,
  type YoryantraTool,
} from "@/app/data/tools";

type YoryantraRelatedToolsProps = {
  currentHref: YoryantraTool["href"];
  limit?: number;
  className?: string;
};

export default function YoryantraRelatedTools({
  currentHref,
  limit = 6,
  className = "",
}: YoryantraRelatedToolsProps) {
  const currentTool = getToolByHref(currentHref);

  if (!currentTool) {
    return null;
  }

  const relatedTools = getRelatedTools(
    currentHref,
    currentTool.category,
    limit,
  );

  const categoryHref = getCategoryHref(currentTool.category);

  return (
    <nav
      aria-label={`Related tools in ${currentTool.category}`}
      className={`flex flex-wrap gap-3 ${className}`}
    >
      {relatedTools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="yoryantra-btn-outline"
        >
          {tool.title}
        </Link>
      ))}

      <Link
        href={categoryHref}
        className="yoryantra-btn-outline"
      >
        {currentTool.category}
      </Link>
    </nav>
  );
}
