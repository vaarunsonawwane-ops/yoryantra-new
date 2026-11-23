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
  presentation?: "buttons" | "links";
};

export default function YoryantraRelatedTools({
  currentHref,
  limit = 6,
  className = "",
  presentation = "buttons",
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
      className={`flex flex-wrap ${presentation === "links" ? "gap-x-5 gap-y-3" : "gap-3"} ${className}`}
    >
      {relatedTools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className={presentation === "links" ? "inline-flex items-center text-sm font-medium text-[var(--green)] underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]" : "yoryantra-btn-outline"}
        >
          {tool.title}
        </Link>
      ))}

      <Link
        href={categoryHref}
        className={presentation === "links" ? "inline-flex items-center text-sm font-medium text-[var(--green)] underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]" : "yoryantra-btn-outline"}
      >
        {currentTool.category}
      </Link>
    </nav>
  );
}
